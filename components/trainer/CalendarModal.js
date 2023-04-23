import React from 'react';
import styles from '../../styles/CalendarModal.module.css';

const CalendarModal = ({ children, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {children}
        <button className={styles.closeButton} onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CalendarModal;
