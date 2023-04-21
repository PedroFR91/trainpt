import React, { useState } from 'react';
import styles from '../../styles/routines.module.css';
import { ddbb } from '../../components/Steps/exercises';
const Step4 = ({
  data,
  inputFields,
  setInputFields,
  handleChange,
  addExercises,
  handleCreate,
  prevStep,
}) => {
  const [selectedDay, setSelectedDay] = useState('');

  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  return (
    <div>
      <h2>Añadir ejercicios</h2>
      <label htmlFor='daySelect'>Seleccionar día de entrenamiento:</label>
      <select
        name='daySelect'
        id='daySelect'
        value={selectedDay}
        onChange={handleDayChange}
        className={styles.inputField}
      >
        <option value=''>--Seleccione un día--</option>
        {data.days &&
          data.days.map((day, index) => (
            <option key={index} value={day}>
              {day}
            </option>
          ))}
      </select>
      {selectedDay && (
        <>
          <div>
            {inputFields.map((input, index) => (
              <div key={index}>
                <input
                  name='exercise'
                  placeholder='Ejercicio'
                  value={input.exercise}
                  onChange={(e) => handleChange(index, e, selectedDay)}
                  className={styles.inputField}
                />
                <input
                  name='series'
                  placeholder='Series'
                  value={input.series}
                  onChange={(e) => handleChange(index, e, selectedDay)}
                  className={styles.inputField}
                />
                <input
                  name='reps'
                  placeholder='Repeticiones'
                  value={input.reps}
                  onChange={(e) => handleChange(index, e, selectedDay)}
                  className={styles.inputField}
                />
              </div>
            ))}
            <button onClick={addExercises}>Añadir ejercicio</button>
          </div>
          <div className={styles.listExercises}>
            {ddbb.map((exer) => (
              <div
                key={exer.exercise}
                className={styles.myddbb}
                onClick={addExercises}
              >
                <p>Ejercicio:{exer.exercise}</p>
                <p>Músculo:{exer.muscle}</p>
                <p>Series:{exer.series}</p>
                <p>repeticiones:{exer.reps}</p>
                <p>Peso:{exer.weight}</p>
                <p>Descanso:{exer.rest}</p>
                <p>Notas:{exer.notes}</p>
              </div>
            ))}
          </div>
        </>
      )}
      <button onClick={prevStep}>Atrás</button>
      <button onClick={handleCreate}>Crear Rutina</button>
    </div>
  );
};

export default Step4;
