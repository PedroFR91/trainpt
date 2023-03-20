import React, { useEffect, useState } from 'react';
import moment from 'moment/min/moment-with-locales.js';
import styles from '../../styles/calendar.module.css';
import { db } from '../../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';

const calendar = () => {
  moment.locale('es');
  const [currentDate, setCurrentDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [firebaseDates, setFirebaseDates] = useState([]);

  const formatDate = (timeStamp) => {
    const timeStampMillis =
      timeStamp.seconds * 1000 + timeStamp.nanoseconds / 1000000;
    const date = new Date(timeStampMillis);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  console.log(firebaseDates);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push(formatDate(doc.data().timeStamp)); // Asegúrate de cambiar 'date' por el nombre del campo que contiene la fecha en tu colección de Firebase
        });
        setFirebaseDates(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'months'));
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'months'));
  };

  const handleOpenModal = (date) => {
    setSelectedDate(date.format('D/M/YYYY'));
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
      const formattedDate = date.format('D/M/YYYY');

      const hasEvent = firebaseDates.some(
        (firebaseDate) => formattedDate === firebaseDate
      );

      days.push(
        <div
          key={i}
          onClick={() => handleOpenModal(date)}
          className={`${styles.days} ${hasEvent ? styles.eventDay : ''}`}
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
          <p>Fecha seleccionada: {selectedDate}</p>
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
