import React from 'react';
import styles from '../../styles/chat.module.css';
const Chat = () => {
  return (
    <div className={styles.chat}>
      <div className={styles.circle}></div>
      <div>Abrir Chat</div>
    </div>
  );
};

export default Chat;
