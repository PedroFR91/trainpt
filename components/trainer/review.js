import React from 'react';
import styles from '../../styles/review.module.css';
const review = () => {
  const date = new Date();

  const [month, day, year] = [
    date.getMonth(),
    date.getDate(),
    date.getFullYear(),
  ];
  var currentmonth;
  switch (month) {
    case month === 0:
      currentmonth = 'Enero';
      break;
    case month === 1:
      currentmonth = 'Febrero';
      break;
    case month === 2:
      currentmonth = 'Marzo';
      break;
    case month === 3:
      currentmonth = 'Abril';
      break;
    case month === 4:
      currentmonth = 'Mayo';
      break;
    case month === 5:
      currentmonth = 'Junio';
      break;
    case month === 6:
      currentmonth = 'Julio';
      break;
    case month === 7:
      currentmonth = 'Agosto';
      break;
    case month === 8:
      currentmonth = 'Septiembre';
      break;
    case month === 9:
      currentmonth = 'Octubre';
      break;
    case month === 10:
      currentmonth = 'Noviembre';
      break;
    case month === 11:
      currentmonth = 'Diciembre';
      break;
    default:
      break;
  }
  return (
    <div className={styles.review}>
      <h1>{currentmonth}</h1>
      <p>{day}</p>
      <p>{year}</p>
    </div>
  );
};

export default review;
