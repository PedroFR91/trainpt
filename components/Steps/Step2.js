import React from 'react';
import styles from '../../styles/routines.module.css';
const Step2 = ({
  setData,
  data,
  days,
  nextStep,
  prevStep,
  handleSelectDay,
}) => {
  return (
    <div className={styles.stepContainer}>
      <h2>Selecciones los días de entrenamiento</h2>
      <div className={styles.days}>
        {days.map((dayObj, index) => (
          <div key={index}>
            <label htmlFor={dayObj.day}>{dayObj.day}</label>
            <input
              type='checkbox'
              id={dayObj.day}
              name={dayObj.day}
              onChange={(e) => handleSelectDay(dayObj.day, e.target.checked)}
              checked={data.days && data.days.includes(dayObj.day)}
              className={styles.checkboxField}
            />
          </div>
        ))}
      </div>
      <button onClick={prevStep}>Atrás</button>
      <button onClick={nextStep}>Siguiente</button>
    </div>
  );
};

export default Step2;
