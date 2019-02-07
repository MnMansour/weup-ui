import React from 'react';
import classNames from 'classnames';
import styles from "./welcome_message.module.scss";

import close from '../assets/icons/close.svg';
import Rotation from '../assets/icons/3d_rotation.svg';


const WelcomeMessage = ({message, closeWelcomeMessage, show}) => (
  <div className={classNames(styles.WelcomeMessage, {[styles.hide]: !show})} >
    <div className={styles.WelcomeMessage_box}>
      <div className={styles.WelcomeMessage_header}>
        <h4>Welcome</h4>
        <img onClick={closeWelcomeMessage} src={close} alt="close"/>
      </div>
      <div className={styles.WelcomeMessage_body}>
        <div className={styles.message_text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam.</div>
        <img src={Rotation} alt="Rotation"/>
        <h4>Click and hold to rotate</h4>
      </div>
      <div className={styles.WelcomeMessage_footer}>
        <button onClick={closeWelcomeMessage}>Got it</button>
      </div>
    </div>
  </div>
)

export default WelcomeMessage;
