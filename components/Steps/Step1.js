import React from 'react';
import styles from '../../styles/routines.module.css';
const Step1 = ({ setData, data, nextStep }) => {
  return (
    <div className={styles.stepContainer}>
      <h2>Creación de rutinas</h2>
      <input
        type='text'
        placeholder='Nombre de la Rutina'
        onChange={(e) => setData({ ...data, nameroutine: e.target.value })}
        className={styles.inputField}
      />
      <input
        type='text'
        placeholder={data.desroutine ? data.desroutine : 'Descripción'}
        onChange={(e) => setData({ ...data, desroutine: e.target.value })}
        className={styles.inputField}
        required
      />
      <button onClick={nextStep}>Siguiente</button>
    </div>
  );
};

export default Step1;
