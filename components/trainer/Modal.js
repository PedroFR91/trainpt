// components/Modal.js

import React from 'react';
import styles from '../../styles/Modal.module.css';

const Modal = ({ children, isOpen, closeModal }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={closeModal}>
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
