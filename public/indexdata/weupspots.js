function krpanoplugin(){
    var local = this;   // save the 'this' pointer from the current plugin object
    var krpano = null;  // the krpano and plugin interface objects
	var device = null;
    var plugin = null;
	var threeCamera = null;

	var debug = false; //@Debug

	var shouldPositionControllerOpenOnStart = false;
	var positionController;
	var keyboardPromtController;

    //Has the project been run before
    var firstRun = true;

    // registerplugin - startup point for the plugin (required)
    // - krpanointerface = krpano interface object
    // - pluginpath = the fully qualified plugin name (e.g. "plugin[name]")
    // - pluginobject = the xml plugin object itself
    local.registerplugin = function(krpanointerface, pluginpath, pluginobject){
		console.log("Started the Krpano version of the 3d spots plugin");

        // get the krpano interface and the plugin object
        krpano = krpanointerface;
		device = krpano.device;
        plugin = pluginobject;

        if (krpano.version < "1.19" || krpano.build < "2017-12-01"){
            krpano.trace(3, local.name+" - too old krpano version (min. 1.19.14)");
            return;
        }

        if (krpano.webGL){
			if(debug){
				krpano.call('showlog();');
				krpano.trace(1, "krpano.webGL properties are detected and can be used in the plugin[" + plugin.name + "]");
			}
        }

		// load the requiered three.js scripts then run all ThreeJS code
		load_scripts(["WeupSpots/categories.js","ThreeJS/three.min.js","ThreeJS/OBJLoader.js"], setInitialValues); //Note that the setUpThreJS function is run here
    };



	//All scripts loaded. Initialize values
	function setInitialValues(){

		if(debug){
			krpano.trace(1, "Finished loading external scripts");
		}
		//Setup postion controller debug mode
		if(devModeString != "")
		{
			keyboardPromtController = new KeyboardPrompt(devModeString, devModeTimeout);
		}

		setDefaultAltitude(); // Add the default altitude to Krpano

		renderer = new THREE.WebGLRenderer({canvas:krpano.webGL.canvas, context:krpano.webGL.context});
		renderer.autoClear = false;
		renderer.setPixelRatio(1);	// krpano handles the pixel ratio scaling

		// restore the krpano WebGL settings (for correct krpano rendering)
		restore_krpano_WebGL_state();

		// use the krpano onviewchanged event as render-frame callback (this event will be directly called after the krpano pano rendering)
		krpano.set("events[__threejs__].keep", true);
		krpano.set("events[__threejs__].onviewchange", adjust_krpano_rendering);	// correct krpano view settings before the rendering

		krpano.set("events[__threejs__].onloadcomplete", newScene);

		krpano.set("events[__threejs__].onnewscene", startNewScene);

		krpano.set("events[__threejs__].onviewchanged", render_frame);

		// enable continuous rendering (that means render every frame, not just when the view has changed)
		krpano.view.continuousupdates = false; //@TODO: Figure out how to make touch work without this

		// basic ThreeJS objects
		scene = new THREE.Scene();
		threeCamera = new THREE.Camera();
		stereocamera = new THREE.Camera();
		camera_hittest_raycaster = new THREE.Raycaster();
		krpano_panoview_euler = new THREE.Euler();

		// restore the krpano WebGL settings (for correct krpano rendering)
		restore_krpano_WebGL_state();

		//Create panorame position controller
		if(shouldPositionControllerOpenOnStart)
		{
			createPositionControlDivs();
		}

		// build the ThreeJS scene (start adding custom code there)
		build_scene();
	};


	// helpers
	var M_RAD = Math.PI / 180.0;
	var M_DEG = 180 / Math.PI;

	// ThreeJS/krpano objects
	var renderer = null;
	var scene = null;
	var stereocamera = null;
	var camera_hittest_raycaster = null;
	var krpano_panoview = null;
	var krpano_panoview_euler = null;
	var krpano_projection = new Float32Array(16);	// krpano projection matrix

	var krpano_depthbuffer_scale = (farClip+nearClip)/(farClip-nearClip);
	var krpano_depthbuffer_offset = 2*farClip*nearClip/(nearClip-farClip);



	function restore_krpano_WebGL_state()
	{
		var gl = krpano.webGL.context;

		gl.disable(gl.DEPTH_TEST);
		gl.cullFace(gl.FRONT);
		gl.frontFace(gl.CCW);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.activeTexture(gl.TEXTURE0);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);

		// restore the current krpano WebGL program
		krpano.webGL.restoreProgram();
	}


	function restore_ThreeJS_WebGL_state()
	{
		var gl = krpano.webGL.context;

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.clearDepth(1);
		gl.clear(gl.DEPTH_BUFFER_BIT);

		renderer.state.reset();
	}

	function krpano_projection_matrix(sw,sh, zoom, xoff,yoff)
	{
		var m = krpano_projection;

		var pr = device.pixelratio;
		sw = pr / (sw*0.5);
		sh = pr / (sh*0.5);

		m[0]  = zoom*sw;    m[1]  = 0;          m[2]  = 0;                          m[3]  = 0;
		m[4]  = 0;          m[5]  = -zoom*sh;   m[6]  = 0;                          m[7]  = 0;
		m[8]  = xoff;       m[9]  = -yoff*sh;   m[10] = krpano_depthbuffer_scale;   m[11] = 1;
		m[12] = 0;          m[13] = 0;          m[14] = krpano_depthbuffer_offset;  m[15] = 1;
	}

	function update_camera_matrix(camera)
	{
		var m = krpano_projection;
		camera.projectionMatrix.set(m[0],m[4],m[8],m[12], m[1],m[5],m[9],m[13], m[2],m[6],m[10],m[14], m[3],m[7],m[11],m[15]);
	}

	//@@Adjust
	function adjust_krpano_rendering()
	{
		if (krpano.view.fisheye != 0.0)
		{
			// disable the fisheye distortion, ThreeJS objects can't be rendered with it
			krpano.view.fisheye = 0.0;
		}
	}

	//@@Render
	function render_frame()
	{
        // do spot updates
		update_scene();


		var gl = krpano.webGL.context;
		var vr = krpano.webVR && krpano.webVR.enabled ? krpano.webVR : null;

		var sw = gl.drawingBufferWidth;
		var sh = gl.drawingBufferHeight;

		// setup WebGL for ThreeJS
		restore_ThreeJS_WebGL_state();

		// set the camera/view rotation
		krpano_panoview = krpano.view.getState(krpano_panoview);	// the 'krpano_panoview' object will be created and cached inside getState()
		krpano_panoview_euler.set(-krpano_panoview.v * M_RAD, (krpano_panoview.h-90) * M_RAD, krpano_panoview.r * M_RAD, "YXZ");
		threeCamera.quaternion.setFromEuler(krpano_panoview_euler);
		threeCamera.updateMatrixWorld(true);

		// set the camera/view projection
		krpano_projection_matrix(sw,sh, krpano_panoview.z, 0, krpano_panoview.yf);
		update_camera_matrix(threeCamera);

		// render the scene
		if (krpano.display.stereo == false)
		{
			// normal rendering
			renderer.setViewport(0,0, sw,sh);
			renderer.render(scene, threeCamera);
		}
		else
		{
			// stereo / VR rendering
			sw *= 0.5;	// use half screen width

			var stereo_scale = 0.05;
			var stereo_offset = Number(krpano.display.stereooverlap);

			// use a different camera for stereo rendering to keep the normal one for hit-testing
			stereocamera.quaternion.copy(threeCamera.quaternion);
			stereocamera.updateMatrixWorld(true);

			// render left eye
			var eye_offset = -0.03;
			krpano_projection_matrix(sw,sh, krpano_panoview.z, stereo_offset, krpano_panoview.yf);

			if (vr)
			{
				eye_offset = vr.eyetranslt(1);						// get the eye offset (from the WebVR API)
				vr.prjmatrix(1, krpano_projection);					// replace the projection matrix (with the one from WebVR)
				krpano_projection[10] = krpano_depthbuffer_scale;	// adjust the depthbuffer scaling
				krpano_projection[14] = krpano_depthbuffer_offset;
			}

			// add the eye offset
			krpano_projection[12] = krpano_projection[0] * -eye_offset * stereo_scale;

			update_camera_matrix(stereocamera);
			renderer.setViewport(0,0, sw,sh);
			renderer.render(scene, stereocamera);

			// render right eye
			eye_offset = +0.03;
			krpano_projection[8] = -stereo_offset;	// mod the projection matrix (only change the stereo offset)

			if (vr)
			{
				eye_offset = vr.eyetranslt(2);						// get the eye offset (from the WebVR API)
				vr.prjmatrix(2, krpano_projection);					// replace the projection matrix (with the one from WebVR)
				krpano_projection[10] = krpano_depthbuffer_scale;	// adjust the depthbuffer scaling
				krpano_projection[14] = krpano_depthbuffer_offset;
			}

			// add the eye offset
			krpano_projection[12] = krpano_projection[0] * -eye_offset * stereo_scale;

			update_camera_matrix(stereocamera);
			renderer.setViewport(sw,0, sw,sh);
			renderer.render(scene, stereocamera);
		}

		// important - restore the krpano WebGL state for correct krpano rendering
		restore_krpano_WebGL_state();
	};

    	//@@Update
	function update_scene()
	{
		if (!firstRun) //If values have been set atleast once
		{
			updateScreenCoordinates();
      updateReactState(categoriesJson.categories)
		}
	}


	function iterateAllPositions()
	{
		//@NOTE complete get example //var heading = krpano.get("scene[get(xml.scene)].heading");
		var sname = krpano.get("xml.scene");

		var lat = krpano.get("scene["+sname+"].latitude");
		var lon = krpano.get("scene["+sname+"].longitude");

		var heading = parseFloat(krpano.get("scene["+sname+"].heading"));

		var altitude = krpano.get("scene["+sname+"].altitude");

		var index = krpano.get("scene["+sname+"].index");

		//This is for the dev menu
		if(positionController)
		{
			positionController.getCurrentPanoValues(sname,index,lat,lon,heading,altitude);
		}

        //Iterate all spots and update their horizintal coordinates
		for (i = 0; i < categoriesJson.categories.length; i++)
		{
			for (j = 0; j < categoriesJson.categories[i].subcategories.length; j++)
			{
                var subCat = categoriesJson.categories[i].subcategories[j];
                subCat.horizontalCoordinates = LatLonToHorizontalCoordinates(lat,lon,heading,altitude,subCat.wgsCoordinates);
			}
		}
	};

	function startNewScene()
	{
		iterateAllPositions();
	};

	//@@newScene
	function newScene()
	{
		if(firstRun) //This is only run at the first new scene
		{
			iterateAllPositions();
      updateScreenCoordinates();
		}
		firstRun = false;
	};

	//Updates the screenspace position of spots eny time the user interacts with the panorama
	//@@TODO: Consider adding a currently visible tag to limit amount of updates
	function updateScreenCoordinates()
	{
    	for (i = 0; i < categoriesJson.categories.length; i++)
		{
            for (j = 0; j < categoriesJson.categories[i].subcategories.length; j++)
            {
                var spot = categoriesJson.categories[i].subcategories[j];

                var krpanoScreen = krpano.spheretoscreen(spot.horizontalCoordinates[1],spot.horizontalCoordinates[0]);

                spot.screenCoordinates.left =  krpanoScreen.x;
                spot.screenCoordinates.top =  krpanoScreen.y;
            }
		}

        if(debug){
			console.log(categoriesJson.categories[0].subcategories[0].screenCoordinates);
		}
	};

    //Sets the default panorama height if hasn't been set in the scene xml beforehand
	function setDefaultAltitude()
	{
		var scenes = krpano.get("scene");

		var scenesArr = scenes.getArray();

		if(debug){
			krpano.trace(1,krpano.get("xml.scene"));
		}

		//Write new default altitude value to scene elements
		for (i=0; i < scenesArr.length; i++)
		{
			if(krpano.get("scene["+scenesArr[i].name+"].altitude") == null) // Don't overwrite if values have been saved already in the XML
			{
				krpano.set("scene["+scenesArr[i].name+"].altitude",defaultCameraAltitude);
			}
		}
	};

/*
// -----------------------------------------------------------------------
// Devmode related functions start here
*/

	function KeyboardPrompt(promtWord,timeout)
	{
		this.promtWord = promtWord;
		this.timeout = timeout;

		this.currentLetterIndex = 0;

		this.timeoutId;

		$(document).on("keydown",{ thisClass: this }, this.iterateKey);
	}

	KeyboardPrompt.prototype.iterateKey = function(event)
	{
		if(!positionController)
		{
			if(event.data.thisClass.currentLetterIndex >= event.data.thisClass.promtWord.length)
			{
				event.data.thisClass.currentLetterIndex = 0;
			}

			var x = String.fromCharCode(event.which || event.keyCode);
			var y = event.data.thisClass.promtWord.charAt(event.data.thisClass.currentLetterIndex).toUpperCase();;

			if(x == y)
			{
				window.clearTimeout(event.data.thisClass.timeoutId);
				keyboardPromtController.timeoutId = window.setTimeout(keyboardPromtController.timeoutErase, keyboardPromtController.timeout);

				event.data.thisClass.currentLetterIndex++;
				if(event.data.thisClass.currentLetterIndex >= event.data.thisClass.promtWord.length)
				{
					createPositionControlDivs();
					startNewScene();

					//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
					krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");
				}
			}
			else
			{
				keyboardPromtController.timeoutErase();
			}
		}
	}
	KeyboardPrompt.prototype.timeoutErase = function()
	{
		keyboardPromtController.currentLetterIndex = 0;
	}

	function PositionController(parentDiv, currPanoNameDiv, latDiv, lonDiv, headingDiv, altitudeDiv, prevButtonDiv, nextButtonDiv)
	{
		this.name = null;
		this.sceneIndex = null;

		this.parentDiv = parentDiv;
		this.currPanoNameDiv = currPanoNameDiv;
		this.latDiv = latDiv;
		this.lonDiv = lonDiv;
		this.headingDiv = headingDiv;
		this.altitudeDiv = altitudeDiv;

		this.prevButtonDiv = prevButtonDiv;
		this.nextButtonDiv = nextButtonDiv;

		this.defaultValues = null;

		//@TODO: Consider adding the fake save div here for easier deletion
	}
	PositionController.prototype.getCurrentPanoValues = function(name, sceneIndex, lat, lon, heading, altitude)
	{
		this.name = name;
		this.sceneIndex = sceneIndex;

		$(this.currPanoNameDiv).text(name);
		$(this.latDiv).val(lat);
		$(this.lonDiv).val(lon);
		$(this.headingDiv).val(heading);
		$(this.altitudeDiv).val(altitude);
		if(this.defaultValues == null)
		{
			this.defaultValues = [name,lat,lon,heading,altitude]; //Copy array values to new array
		}
		else
		{
			if(this.defaultValues[0] != name) //if new scene
			{
				this.defaultValues = [name,lat,lon,heading,altitude]; //Copy array values to new array
			}
		}

		if(sceneIndex == 0)
		{
			$(this.prevButtonDiv).addClass('greyedOut');

			$(this.nextButtonDiv).removeClass('greyedOut');
		}
		else
		{
			$(this.prevButtonDiv).removeClass('greyedOut');

			if(sceneIndex >= (krpano.get("scene.count")-1))
			{
				$(this.nextButtonDiv).addClass('greyedOut');
			}
			else
			{
				$(this.nextButtonDiv).removeClass('greyedOut');
			}
		}
	}
	PositionController.prototype.setAllKrpanoValues = function()
	{
		krpano.set("scene[get(xml.scene)].latitude",this.latDiv);
		krpano.set("scene[get(xml.scene)].longitude",this.lonDiv);
		krpano.set("scene[get(xml.scene)].heading",this.heading);
	}
	PositionController.prototype.resetDefault = function()
	{
		krpano.set("scene[get(xml.scene)].latitude",this.defaultValues[1]);
		krpano.set("scene[get(xml.scene)].longitude",this.defaultValues[2]);
		krpano.set("scene[get(xml.scene)].heading",this.defaultValues[3]);

		startNewScene();

		//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
		krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");
	}
	PositionController.prototype.removeController = function()
	{
		$(this.parentDiv).remove();
		positionController = null;
	}
	PositionController.prototype.previousScene = function()
	{
		var newIndex = this.sceneIndex-1;

		if(newIndex >= 0){
			krpano.call("loadscene("+krpano.get("scene["+newIndex+"].name")+",,KEEPVIEW,BLEND(0))");
		}
	}
	PositionController.prototype.nextScene = function()
	{
		var newIndex = this.sceneIndex+1;
		if(newIndex <= (krpano.get("scene.count")-1)){
			krpano.call("loadscene("+krpano.get("scene["+newIndex+"].name")+",,KEEPVIEW,BLEND(0))");
		}
	}

	function createPositionControlDivs()
	{
		createStyle('.positionControlContainer','overflow: auto; border-style: ridge; position: absolute;  top: 25vh; left: 50vw; transform: translate(-50%,-50%); width: 300px; height: auto; background: rgba(0, 0, 0, 0.5);');

		createStyle('.inputField','margin : 0px; box-shadow: none;');

		createStyle('.names','color: white; font-weight: 128; font-size: 14px;');

		createStyle('.greyedOut','color: grey');

		var parentDiv = createElement(jQuery("#panoDIV"),'div','positionControlContainer',null);

		var firstRowParent = createElement(parentDiv,'div','names',null);

		var prevPanoButton = createElement(firstRowParent,'button',null,'<');
		prevPanoButton.addEventListener("click", function(event){
			event.preventDefault();
			positionController.previousScene();
		});

		var currPanoNameDiv = createElement(firstRowParent,'div','names','pano');
		$(currPanoNameDiv).css('display','inline');

		var nextPanoButton = createElement(firstRowParent,'button',null,'>');
		nextPanoButton.addEventListener("click", function(event){
			event.preventDefault();
			positionController.nextScene();
		});

		var latName = createElement(parentDiv,'div','names','lat: ');
		var lat = createElement(latName,'input','inputField',null);
		lat.type = 'number';
		lat.step = '0.00001';
		lat.addEventListener("input", function(event) {
			event.preventDefault();
			krpano.set("scene[get(xml.scene)].latitude",$(this).val());

			startNewScene();

			//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
			krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");
		});


		var lonName = createElement(parentDiv,'div','names','lon: ');
		var lon = createElement(lonName,'input','inputField',null);
		lon.type = 'number';
		lon.step = '0.000025';
		lon.addEventListener("input", function(event) {
			event.preventDefault();
			krpano.set("scene[get(xml.scene)].longitude",$(this).val());

			startNewScene();

			//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
			krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");

		});

		var headingName = createElement(parentDiv,'div','names','heading: ');
		var heading = createElement(headingName,'input','inputField',null);
		heading.type = 'number';
		heading.step = '0.5';
		heading.addEventListener("input", function(event) {
			event.preventDefault();
			krpano.set("scene[get(xml.scene)].heading",$(this).val());

			startNewScene();

			//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
			krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");

		});
		var altitudeName = createElement(parentDiv,'div','names','altitude: ');
		var altitude = createElement(altitudeName,'input','inputField',null);
		$(altitude).val(0);
		altitude.type = 'number';
		altitude.step = '1';
		altitude.addEventListener("input", function(event) {
			event.preventDefault();

			krpano.set("scene[get(xml.scene)].altitude",$(this).val());

			startNewScene();

			//Force krpano to redraw its WebGL context. This is a hack //@@TODO: Fix this properly
			krpano.call("lookto("+(krpano.get("view.hlookat")+0.0001)+", "+(krpano.get("view.vlookat")+0.0001)+")");

		});

		var resetButton = createElement(parentDiv,'button',null,'Reset');
		resetButton.addEventListener("click", function(event){
			event.preventDefault();
			positionController.resetDefault();
		});

		var saveButton = createElement(parentDiv,'button',null,'Save XML');
		$(saveButton).css('float','right');
		saveButton.addEventListener("click", function(event){
			event.preventDefault();
			saveIndexXML();
		});


		positionController = new PositionController(parentDiv, currPanoNameDiv, lat, lon, heading, altitude, prevPanoButton, nextPanoButton);

		var exitButton = createElement(firstRowParent,'button',null,'X');
		$(exitButton).css('display','inline');
		$(exitButton).css('float','right');
		exitButton.addEventListener("click", function(event){
			event.preventDefault();
			positionController.removeController();
		});
	}

	function saveIndexXML()
	{
		var xmlFileName = "index";

		var indexXmlUrl = krpano.parsepath("%CURRENTXML%"+xmlFileName+".xml");

		if(indexXmlUrl)
		{
			var mainHttp = new XMLHttpRequest();

			mainHttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
				RewriteXML(this);
				}
			};
			mainHttp.open("GET", indexXmlUrl, true);
			mainHttp.send();
		}

		function RewriteXML(xml)
		{
			var xmlDoc = xml.responseXML;

			var xmlScenes = xmlDoc.getElementsByTagName("scene");

			for (i=0; i < xmlScenes.length; i++)
			{
				var sceneName = xmlScenes[i].getAttribute('name');

				var lat = krpano.get("scene["+sceneName+"].latitude");
				xmlScenes[i].setAttribute('latitude',lat);

				var lon = krpano.get("scene["+sceneName+"].longitude");
				xmlScenes[i].setAttribute('longitude',lon);

				var heading = krpano.get("scene["+sceneName+"].heading");
				xmlScenes[i].setAttribute('heading',heading);

				var altitude = krpano.get("scene["+sceneName+"].altitude");
				xmlScenes[i].setAttribute('altitude',altitude);
			}
			//Save XML as string text file
			var serielizer = new XMLSerializer();
			SaveXML(serielizer.serializeToString(xmlDoc),xmlFileName);
		}

		function SaveXML(xmlAsString,name)
		{
			var textFileAsBlob = new Blob([xmlAsString], {type:'text/xml'});
			var fileNameToSaveAs = name+".xml";

			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			$(downloadLink).css('background-color','red');
			$(downloadLink).css('width','256px');
			$(downloadLink).css('height','256px');
			downloadLink.innerHTML = "Download File";

			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			//downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);

			downloadLink.click();
		}
	}

/*
// -----------------------------------------------------------------------
// ThreeJS content starts here
*/
	var clock = null;
	var drawForceBox = null; //The forcer of drawing the ThreeJS context


	// add a krpano hotspot like handling for the 3d objects
	function assign_object_properties(obj, properties)
	{
		// set defaults (krpano hotspot like properties)
		if (properties          	=== undefined)	properties         		= {};
		if (properties.name			=== undefined) 	properties.name 		= "";
		if (properties.coordinates	=== undefined) 	properties.coordinates 	= [0,0];
		if (properties.altitude     === undefined)	properties.altitude    	= 0;
		if (properties.lastPosition	=== undefined)	properties.lastPosition	= new THREE.Vector3( 0, 0, 0 );

		obj.properties = properties;
	}

	function setLatLonProperties(obj,boxX,boxY,boxZ,heading)
	{
		obj.properties.lastPosition = obj.position;

		//Rotate position by heading
		var position = new THREE.Vector3(-boxX,boxZ,-boxY);

		if(heading < 0)
		{
			heading = 360 - (-heading);
		}

		var axis = new THREE.Vector3( 0, 1, 0 );
		var angle = heading * M_RAD;

		position.applyAxisAngle( axis, angle );

		obj.position.set(position.x,position.y,position.z);

		obj.rotation.set(0, parseFloat(heading) * M_RAD,0);

		obj.scale.set(1000, 1000, 1000);

		obj.updateMatrix();
	}

	function build_scene()
	{
		clock = new THREE.Clock();
		// load 3d objects

		var mtterial = new THREE.MeshPhongMaterial( {color: new THREE.Color("rgb(128, 128, 128)") } );
		mtterial.transparent = false;

		var size = nearClip*2.1;
		drawForceBox = new THREE.Mesh(new THREE.BoxGeometry(size,size,size), mtterial); //This is a hacky way to force drawing at all times //@TODO: Fix this to a proper solution
        drawForceBox.frustumCulled = false;
		scene.add( drawForceBox );

	}



/**************Helper functions******************/

function createStyle(name,rules)
{

    var style = document.createElement('style');
    style.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(style);
    if(!(style.sheet||{}).insertRule)
        (style.styleSheet || style.sheet).addRule(name, rules);
    else
        style.sheet.insertRule(name+"{"+rules+"}",0);
};

function createElement(parent,elementType,styleClass,content)
{

  var element = document.createElement(elementType);
  if(parent == null)
  {
    document.body.appendChild(element);
  }
  else
  {
    $(parent).append(element);
  }
  if (styleClass != null)
  {
    $(element).addClass(styleClass);
  }
  if (content != null)
  {
    $(element).html(content);
  }
  return element;
};

function resolve_url_path(url)
{
    if (url.charAt(0) != "/" && url.indexOf("://") < 0)
    {
        // adjust relative url path
        url = krpano.parsepath("indexdata/graphics/" + url); //@TODO: Get plugin folder name
    }

    return url;
};

function load_scripts(urls, callback)
{
    if (urls.length > 0)
    {
        var url = resolve_url_path( urls.splice(0,1)[0] );

        var script = document.createElement("script");
        script.src = url;
        script.addEventListener("load", function(){ load_scripts(urls,callback); });
        script.addEventListener("error", function(){ krpano.trace(3,"loading file '"+url+"' failed!"); });
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    else
    {
        // done
        if(callback){
            callback();
        }
    }
};

function LatLonToHorizontalCoordinates(lat,lon,heading,altitude,wgsCoordinates)
{
    var xSign = Math.sign(wgsCoordinates.lat - lat);
    var ySign = Math.sign(lon - wgsCoordinates.lon);

    var xhav = haversine([wgsCoordinates.lat,wgsCoordinates.lon],[lat,wgsCoordinates.lon]) * xSign;
    var yhav = haversine([wgsCoordinates.lat,wgsCoordinates.lon],[wgsCoordinates.lat,lon]) * ySign;

    var z = (altitude - wgsCoordinates.alt)*-1000;

    var direction = Normalize([yhav,z,xhav]);

    var horizontalCoordinates = DirectionToHorizontalCoordinates(direction);

    //Heading is offset in the following line
    horizontalCoordinates[1] += heading;

    return horizontalCoordinates;
};

function Magnitude(vector)
{
	return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
};

function Normalize(vector)
{
	var num = Magnitude(vector);
	return [vector[0] / num, vector[1] / num, vector[2] / num];
};

function Cross(vectorA, vectorB)
{
    return [vectorA[1] * vectorB[2] - vectorA[2] * vectorB[1], vectorA[2] * vectorB[0] - vectorA[0] * vectorB[2], vectorA[0] * vectorB[1] - vectorA[1] * vectorB[0]];
};

function DirectionToHorizontalCoordinates(forward)
{
	var up = [0, 1, 0];

	var cross = Cross(up, forward);
	var right = Normalize(cross);
	up = Cross(forward, right);

	var m00 = right[0];
	var m01 = right[1];
	var m02 = right[2];
	var m10 = up[0];
	var m11 = up[1];
	var m12 = up[2];
	var m20 = forward[0];
	var m21 = forward[1];
	var m22 = forward[2];

	var num8 = m00 + m11 + m22;
	var quaternion = [0,0,0,0];

	if (num8 > 0)
	{
		var num = Math.sqrt(num8 + 1);
		quaternion[3] = num * 0.5;
		num = 0.5 / num;
		quaternion[0] = (m12 - m21) * num;
		quaternion[1] = (m20 - m02) * num;
		quaternion[2] = (m01 - m10) * num;
	}
	else if ((m00 >= m11) && (m00 >= m22))
	{
		var num7 = Math.sqrt(((1 + m00) - m11) - m22);
		var num4 = 0.5 / num7;
		quaternion[0] = 0.5 * num7;
		quaternion[1] = (m01 + m10) * num4;
		quaternion[2] = (m02 + m20) * num4;
		quaternion[3] = (m12 - m21) * num4;
	}
	else if (m11 > m22)
	{
		var num6 = Math.sqrt(((1 + m11) - m00) - m22);
		var num3 = 0.5 / num6;
		quaternion[0] = (m10 + m01) * num3;
		quaternion[1] = 0.5 * num6;
		quaternion[2] = (m21 + m12) * num3;
		quaternion[3] = (m20 - m02) * num3;
	}
	else
	{
		var num5 = Math.sqrt(((1 + m22) - m00) - m11);
		var num2 = 0.5 / num5;
		quaternion[0] = (m20 + m02) * num2;
		quaternion[1] = (m21 + m12) * num2;
		quaternion[2] = 0.5 * num5;
		quaternion[3] = (m01 - m10) * num2;
	}

	//To euler rad
	var v = [0,0];
	v[1] = Math.atan2(2 * quaternion[3] * quaternion[1] + 2 * quaternion[2] * quaternion[0], 1 - 2 * (quaternion[0] * quaternion[0] + quaternion[1] * quaternion[1]));// Azimuth

	v[0] = Math.asin(2 * (quaternion[3] * quaternion[0] - quaternion[1] * quaternion[2]));

	v = [v[0]*M_DEG,v[1]*-M_DEG];

	return v;
};

function haversine(coords1, coords2)
{
  var lat1 = coords1[0];
  var lon1 = coords1[1];

  var lat2 = coords2[0];
  var lon2 = coords2[1];

  //var ToMeter = 6371000; // m

  var ToMeter = 6371000000; // ThreeJS units

  var x1 = lat2 - lat1;
  var dLat = x1 * M_RAD;
  var x2 = lon2 - lon1;
  var dLon = x2 * M_RAD;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * M_RAD) * Math.cos(lat2 * M_RAD) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var con = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = ToMeter * con;

  return distance;
};


local.unloadplugin = function()
{
    // no unloading support at the moment
};

// onresize (optionally)
// - width,height = the new spotSize for the plugin
// - when not defined then only the krpano plugin html element will be sized
local.onresize = function(width,height)
{
    // not used in this example
    // the plugin content will resize automatically because
    // of the width=100%, height=100% CSS style
    return false;
};
};
