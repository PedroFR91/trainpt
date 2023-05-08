import React from 'react';
import styles from '../../styles/routines.module.css';
const Step3 = ({
  setData,
  data,
  days,
  handleCreateTraining,
  nextStep,
  prevStep,
}) => {
  const handleInputChange = (e, day) => {
    const { name, value } = e.target;
    setData({ ...data, [name + day]: value });
  };

  return (
    <div className={styles.stepContainer}>
      {data.days &&
        data.days.map((day, index) => (
          <div key={index} className={styles.column}>
            <h2>Entrenamiento {day}</h2>
            <input
              type='text'
              name='nametrain'
              placeholder={`Nombre  `}
              onChange={(e) => handleInputChange(e, day)}
              className={styles.inputField}
            />
            <input
              type='text'
              name='destrain'
              placeholder={`Descripción `}
              onChange={(e) => handleInputChange(e, day)}
              className={styles.inputField}
            />
            <input
              type='text'
              name='muscles'
              placeholder={`Músculos trabajados `}
              onChange={(e) => handleInputChange(e, day)}
              className={styles.inputField}
            />
          </div>
        ))}
      <button onClick={prevStep}>Atrás</button>
      <button onClick={nextStep}>Siguiente</button>
      <button onClick={handleCreateTraining}>Crear Entrenamientos</button>
    </div>
  );
};

export default Step3;
