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
    <div>
      <h2>Selecciones los días de entrenamiento</h2>
      <div>
        {days.map((dayObj, index) => (
          <div key={index}>
            <input
              type='checkbox'
              id={dayObj.day}
              name={dayObj.day}
              onChange={(e) => handleSelectDay(dayObj.day, e.target.checked)}
              checked={data.days && data.days.includes(dayObj.day)}
              className={styles.inputField}
            />

            <label htmlFor={dayObj.day}>{dayObj.day}</label>
          </div>
        ))}
      </div>
      <button onClick={prevStep}>Atrás</button>
      <button onClick={nextStep}>Siguiente</button>
    </div>
  );
};

export default Step2;
