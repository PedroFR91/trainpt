import React, { useContext, useEffect, useState } from "react";
import moment from "moment/min/moment-with-locales.js";
import styles from "../../styles/calendar.module.css";
import { db } from "../../firebase.config";
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from 'next/router';
import AuthContext from '../../context/AuthContext'
const calendar = () => {
  moment.locale("es");
  const [currentDate, setCurrentDate] = useState(moment());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [firebaseDates, setFirebaseDates] = useState([]);
  const [formData, setFormData] = useState([]);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [reviewFrequency, setReviewFrequency] = useState("semanal");

  const router = useRouter();
  const startDateFromQuery = router.query.startDate;
  const [currentDateInCalendar, setCurrentDateInCalendar] = useState(moment(startDateFromQuery, "YYYY-MM-DD") || moment());
  const [initialStartDate, setInitialStartDate] = useState(null);

  const [reviewDates, setReviewDates] = useState([]);
  const { myUid } = useContext(AuthContext);
  const trainerId = myUid

  useEffect(() => {
    setReviewDates(calculateReviewDates());
  }, [selectedDate, reviewFrequency]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forms"),
      (snapShot) => {
        let list = []; // 'list' se define aquí
        const formDataList = snapShot.docs.map((doc) => doc.data().formData);

        snapShot.docs.forEach((doc) => {
          const formattedDate = formatDate(doc.data().timeStamp);
          list.push(formattedDate);
        });

        setFirebaseDates(list);
        setFormData(formDataList);
        console.log("Datos de Firebase:", list);

        // Mueve la lógica para establecer la fecha de inicio aquí
        if (list.length > 0 && !initialStartDate) {
          setInitialStartDate(list[0]); // Asume que la primera fecha es la de inicio
        }
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []); // Dependencias del useEffect


  const formatDate = (timeStamp) => {
    const timeStampMillis =
      timeStamp.seconds * 1000 + timeStamp.nanoseconds / 1000000;
    const date = new Date(timeStampMillis);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1
      }/${date.getFullYear()}`;
    return formattedDate;
  };

  const handleNextMonth = () => {
    const newDate = moment(currentDate).add(1, "months");
    console.log("Siguiente mes:", newDate.format("MMMM YYYY")); // Depuración
    setCurrentDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = moment(currentDate).subtract(1, "months");
    console.log("Mes anterior:", newDate.format("MMMM YYYY")); // Depuración
    setCurrentDate(newDate);
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
      <>
        <div key={day} className={styles.daysOfWeek}>
          {day}
        </div>
      </>
    ));
  };

  const generateCalendar = () => {
    const days = [];
    const daysInMonth = currentDate.daysInMonth();
    const firstDay = moment(currentDate).date(1).isoWeekday();
    let dayCounter = 1 - (firstDay - 1);

    for (let i = 1; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
      dayCounter++;
    }

    for (let i = dayCounter; i <= daysInMonth; i++) {
      const date = moment(currentDate).date(i);
      const formattedDate = date.format("D/M/YYYY");

      const hasEvent = firebaseDates.includes(formattedDate);
      const isStartDate = formattedDate === moment(currentDateInCalendar).format("D/M/YYYY");
      const isReviewDate = reviewDates.includes(formattedDate);

      days.push(
        <div
          key={i}
          onClick={() => handleOpenModal(date, selectedFormData)}
          className={`${styles.days} ${hasEvent ? styles.eventDay : ""} ${isStartDate ? styles.startDate : ""} ${isReviewDate ? styles.reviewDate : ""}`}
        >
          {i}
        </div>
      );
    }

    return days;
  };


  const calculateReviewDates = () => {
    let dates = [];
    let currentDate = moment(selectedDate, "D/M/YYYY");

    while (currentDate.isBefore(moment().add(1, "year"))) {
      dates.push(currentDate.format("D/M/YYYY"));

      switch (reviewFrequency) {
        case "semanal":
          currentDate = currentDate.add(1, "weeks");
          break;
        case "quincenal":
          currentDate = currentDate.add(2, "weeks");
          break;
        case "mensual":
          currentDate = currentDate.add(1, "months");
          break;
        default:
          break;
      }
    }
    return dates;
  };

  const fetchSubscriptionId = async () => {
    if (!myUid) {
      console.error("El trainerId está indefinido.");
      return null;
    }

    const querySnapshot = await getDocs(query(collection(db, 'subscriptions'), where("trainerId", "==", myUid)));
    if (!querySnapshot.empty) {
      const subscription = querySnapshot.docs[0];
      return subscription.id;
    } else {
      console.error("No se encontró la suscripción para el entrenador:", myUid);
      return null;
    }
  };
  const fetchStartDate = async (trainerId) => {
    const querySnapshot = await getDocs(query(collection(db, 'subscriptions'), where("trainerId", "==", trainerId)));
    if (!querySnapshot.empty) {
      const subscription = querySnapshot.docs[0]; // Asume que hay una única suscripción para este entrenador
      const startDate = subscription.data().startDate; // Obtiene startDate de la suscripción
      return startDate;
    } else {
      console.error("No se encontró la suscripción para el entrenador:", trainerId);
      return null;
    }
  };
  useEffect(() => {
    const loadStartDate = async () => {
      if (trainerId) {
        const startDate = await fetchStartDate(trainerId);
        if (startDate) {
          setCurrentDate(moment(startDate, "YYYY-MM-DD"));
        }
      }
    };

    loadStartDate();
  }, [trainerId]);

  useEffect(() => {
    if (initialStartDate) {
      // Hacemos una copia de las fechas actuales
      let updatedFirebaseDates = [...firebaseDates];

      // Eliminar la fecha de inicio antigua, si existe
      updatedFirebaseDates = updatedFirebaseDates.filter(date => date !== initialStartDate);

      // Agregar la nueva fecha de inicio
      const newStartDateFormatted = moment(currentDateInCalendar).format("D/M/YYYY");
      if (!updatedFirebaseDates.includes(newStartDateFormatted)) {
        updatedFirebaseDates.push(newStartDateFormatted);
      }

      // Comprobar si realmente necesitamos actualizar el estado
      if (updatedFirebaseDates.length !== firebaseDates.length || !firebaseDates.includes(newStartDateFormatted)) {
        setFirebaseDates(updatedFirebaseDates);
        setInitialStartDate(newStartDateFormatted);
      }
    }
  }, [currentDateInCalendar, initialStartDate]);




  const handleDateChange = async (e) => {
    const selectedStartDate = e.target.value;
    setCurrentDateInCalendar(moment(selectedStartDate, "YYYY-MM-DD"));

    const subscriptionId = await fetchSubscriptionId(myUid);
    if (subscriptionId) {
      const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
      try {
        await updateDoc(subscriptionRef, {
          startDate: selectedStartDate
        });
        console.log("Fecha de inicio actualizada con éxito en Firebase.");
      } catch (error) {
        console.error("Error al actualizar la fecha de inicio en Firebase:", error);
      }
    } else {
      console.log("No se pudo obtener el ID de la suscripción.");
    }
  };

  console.log(myUid)



  return (
    <>
      <div className={styles.container}>
        <h1>{currentDate.format("MMMM YYYY")}</h1>
        <div className={styles.daysOfWeekContainer}>{generateDaysOfWeek()}</div>
        <div className={styles.daysContainer}>{generateCalendar()}</div>
        <div className={styles.controls}>
          <button onClick={handlePrevMonth} className={styles.button}>
            <AiOutlineArrowLeft />
          </button>
          <button onClick={handleNextMonth} className={styles.button}>
            <AiOutlineArrowRight />
          </button>
        </div>
      </div>
      {modalVisible && (
        <div className={styles.modal}>
          <div className={styles.dateInputContainer}>
            <input
              type="date"
              value={moment(currentDateInCalendar).format("YYYY-MM-DD")} // Asegúrate de usar el formato correcto para el valor del input
              onChange={handleDateChange}
            />

            <button >Actualizar Fecha</button>
          </div>
          <p>Establecer la frecuencia de revisión para: {selectedDate}</p>
          <select value={reviewFrequency} onChange={(e) => setReviewFrequency(e.target.value)}>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Cada dos semanas</option>
            <option value="mensual">Mensual</option>
          </select>
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

    </>
  );
};

export default calendar;
