import React, { useEffect, useState } from "react";
import moment from "moment/min/moment-with-locales.js";
import styles from "../../styles/calendar.module.css";
import { db } from "../../firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

const calendar = () => {
  moment.locale("es");
  const [currentDate, setCurrentDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [firebaseDates, setFirebaseDates] = useState([]);
  const [formData, setFormData] = useState([]);
  const [selectedFormData, setSelectedFormData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forms"),
      (snapShot) => {
        let list = [];
        const formDataList = snapShot.docs.map((doc) => doc.data().formData);

        snapShot.docs.forEach((doc) => {
          const formattedDate = formatDate(doc.data().timeStamp);
          list.push(formattedDate);
        });

        setFirebaseDates(list);
        setFormData(formDataList);
        console.log("Datos de Firebase:", list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const formatDate = (timeStamp) => {
    const timeStampMillis =
      timeStamp.seconds * 1000 + timeStamp.nanoseconds / 1000000;
    const date = new Date(timeStampMillis);
    const formattedDate = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;
    return formattedDate;
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, "months"));
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, "months"));
  };

  const handleOpenModal = (date) => {
    setSelectedDate(date.format("D/M/YYYY"));
    const selectedDateIndex = firebaseDates.indexOf(date.format("D/M/YYYY"));
    if (selectedDateIndex !== -1) {
      setSelectedFormData(formData[selectedDateIndex]);
      setModalVisible(true);
    } else {
      setSelectedFormData(null);
      console.log("No hay información adicional disponible.");
    }
    console.log(selectedFormData);
  };

  const generateDaysOfWeek = () => {
    const daysOfWeek = moment.weekdaysShort(); // Obtenemos los nombres cortos de los días de la semana
    const firstDay = daysOfWeek.shift(); // Sacamos el primer día (domingo) y lo almacenamos
    daysOfWeek.push(firstDay); // Agregamos el primer día al final (lunes)
    return daysOfWeek.map((day) => (
      <div key={day} className={styles.daysOfWeek}>
        {day}
      </div>
    ));
  };

  const generateCalendar = () => {
    const days = [];
    const daysInMonth = currentDate.daysInMonth();

    // Obtén el primer día de la semana del 1 de septiembre (viernes)
    const firstDay = moment(currentDate).date(1).isoWeekday();

    // Ajusta el contador de días para comenzar desde el 1 de septiembre
    let dayCounter = 1 - (firstDay - 1);

    // Llena los días anteriores al 1 de septiembre con días vacíos
    for (let i = 1; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={styles.emptyDay}>
          {/* Puedes mostrar un espacio vacío o simplemente dejarlo sin contenido */}
        </div>
      );
      dayCounter++;
    }

    // Agrega los días del mes a partir del 1 de septiembre
    for (let i = dayCounter; i <= daysInMonth; i++) {
      const date = moment(currentDate).date(i);
      const formattedDate = date.format("D/M/YYYY");
      console.log("formattedDate:", formattedDate);

      const hasEvent = firebaseDates.includes(formattedDate);

      days.push(
        <div
          key={i}
          onClick={() => handleOpenModal(date, selectedFormData)}
          className={`${styles.days} ${hasEvent ? styles.eventDay : ""}`}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.container}>
      <h1>{currentDate.format("MMMM YYYY")}</h1>
      <div className={styles.daysOfWeekContainer}>{generateDaysOfWeek()}</div>
      <div className={styles.daysContainer}>{generateCalendar()}</div>
      {modalVisible && (
        <div className={styles.modal}>
          <p>Estos son los eventos del día: {selectedDate}</p>
          {selectedFormData ? (
            <div>
              <p>Información adicional:</p>
              <ul>
                {Object.keys(selectedFormData).map((key) => (
                  <li key={key}>
                    {key}: {selectedFormData[key]}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No hay información adicional disponible.</p>
          )}

          <div
            className={styles.closebutton}
            onClick={() => {
              setModalVisible(false);
            }}
          >
            X
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button onClick={handlePrevMonth} className={styles.button}>
          {moment(currentDate).subtract(1, "months").format("MMMM YYYY")}
        </button>

        <button onClick={handleNextMonth} className={styles.button}>
          {moment(currentDate).add(1, "months").format("MMMM YYYY")}
        </button>
      </div>
    </div>
  );
};

export default calendar;
