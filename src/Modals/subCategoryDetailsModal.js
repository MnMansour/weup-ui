import React, { Component } from 'react';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import { EditorState, ContentState, convertToRaw} from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './modals.scss';
import close from '../assets/icons/close.svg';
import deleteIcon from '../assets/icons/delete.svg';

class SubCategoryDetailsModal extends Component {

  state = {
    editorState: EditorState.createEmpty(),
    Data: {},
    generalData: [],
  }

  onEditorStateChange: Function = (editorState) => {
    this.setState({editorState});
  };

  static getDerivedStateFromProps(nextProps, prevState){
    if( nextProps.Data && (nextProps.Data.id !== prevState.Data.id )){
       return {
         Data:  nextProps.Data,
       };
    }
    else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.Data.id!==this.props.Data.id) {
      if (this.props.Data.id) {
        this.initialState();
      }
    }
  }

  initialState = () => {
    let editorState;
    if (this.state.Data.html) {
      const contentBlock = htmlToDraft(this.state.Data.html);
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }
    this.setState({editorState, Data: this.props.Data, generalData: this.props.Data.data})
  }

  handleOnChange = (e, i) => {
    const {generalData} = this.state;
    const newGeneralData = generalData.slice();
    newGeneralData[i][e.target.name] = e.target.value
    this.setState({generalData: newGeneralData})
  }

  addNewtoGeneralData = () => {
    const {generalData} = this.state;
    const newGeneralData = generalData.slice();
    newGeneralData.push({title: "", value: ""})
    this.setState({generalData: newGeneralData})
  }

  getGeneralData = (generalData) => {
    return generalData ? generalData.map((item, i)=>{
      return(
        <div className="general_data_row" key={i}>
          <input onChange={(e)=>this.handleOnChange(e, i)} name="title" value={item.title} />
          <input onChange={(e)=>this.handleOnChange(e, i)} name="value" value={item.value}/>
          <img onClick={()=>this.removeGeneralData(i)} src={deleteIcon} alt="delete one row" />
        </div>
      )
    }) : null
  }

  removeGeneralData = (index) => {
    const newGeneralData = this.state.generalData.slice();
    newGeneralData.splice(index, 1);
    this.setState({generalData: newGeneralData});
  }

  closeAndRest = () => {
    this.props.closeModal();
    this.initialState();
  }

  saveDetails = () => {
    const {Data, editorState, generalData} = this.state;
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    this.props.list.categories.map((cat)=> {
      cat.subcategories.map( (sub) => {
        if(sub.id === Data.id) {
          sub.html = html;
          sub.data = generalData;
        }
        return null
      })
      return null
    });
    this.closeAndRest()
  }

  render() {
    const { editorState, generalData } = this.state;
    const GeneralData = this.getGeneralData(generalData);
    return (
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.closeModal}
        contentLabel="Edit Subcategory Details"
        className="Modal"
        overlayClassName="Overlay"
      >
        <div className="edit_subcategory_modal">
          <div className="Modal_header">
            <h2>{this.props.Data ? this.props.Data.name : ''}</h2>
            <img onClick={this.props.closeModal} src={close} alt="Colse" />
          </div>
          <div className="Modal_body">
            <div className="general_data">
              <h3>General info: </h3>
              {GeneralData}
              <button onClick={this.addNewtoGeneralData} className="Modal_cancel">Add New</button>
            </div>

            <div>
              <h3>Details: </h3>
              <Editor
                editorState={editorState}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class editor_container"
                toolbar={{
                   list: { inDropdown: true },
                   textAlign: { inDropdown: true },
                   link: { inDropdown: true },
                 }}
                onEditorStateChange={this.onEditorStateChange}
              />
            </div>
          </div>
          <div className="Modal_footer">
            <button onClick={this.saveDetails} className="Modal_save">Save</button>
            <button onClick={this.closeAndRest} className="Modal_cancel">Cancel</button>
          </div>
        </div>
      </Modal>
    );
  }

}

Modal.setAppElement('#root')

function mapStateToProps (state) {
  return {
    list: state.categories_list,
  }
}

export default connect(mapStateToProps, null)(SubCategoryDetailsModal);
