import React, { useEffect, useState } from 'react';
import moment from 'moment/min/moment-with-locales.js';
import styles from '../../styles/calendar.module.css';

const calendar = () => {
  moment.locale('es');
  const [currentDate, setCurrentDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'months'));
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'months'));
  };

  const handleOpenModal = (date) => {
    setSelectedDate(date);
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const generateCalendar = () => {
    const days = [];
    const daysInMonth = currentDate.daysInMonth();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = moment(currentDate).date(i);
      days.push(
        <div
          key={i}
          onClick={() => handleOpenModal(date)}
          className={styles.days}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.container}>
      <div className={styles.daysContainer}>{generateCalendar()}</div>
      {modalVisible && (
        <div>
          <p>
            Fecha seleccionada:{' '}
            {moment(selectedDate).format('D [de] MMMM [de] YYYY')}
          </p>
          <button onClick={handleCloseModal}>Cerrar</button>
        </div>
      )}
      <div className={styles.controls}>
        <button onClick={handlePrevMonth} className={styles.button}>
          Prev
        </button>
        <span>{currentDate.format('MMMM YYYY')}</span>
        <button onClick={handleNextMonth} className={styles.button}>
          Next
        </button>
      </div>
    </div>
  );
};

export default calendar;
