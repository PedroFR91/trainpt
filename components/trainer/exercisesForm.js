import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { db } from '../../firebase.config';
import styles from '../../styles/routines.module.css';
const exercisesForm = () => {
  const [inputFields, setInputFields] = useState([
    { exercise: '', series: '', reps: '' },
  ]);

  const handleChange = (index, e) => {
    let data = [...inputFields];
    data[index][e.target.name] = e.target.value;
    setInputFields(data);
  };
  const addExercises = () => {
    let newexercise = { exercise: '', series: '', reps: '' };
    setInputFields([...inputFields, newexercise]);
  };
  const send = () => {
    console.log(inputFields);
  };

  return (
    <div id='div' className={styles.addexercise}>
      {inputFields.map((input, index) => {
        return (
          <div key={index}>
            <input
              name='exercise'
              placeholder='Ejercicio'
              value={input.exercise}
              onChange={(e) => handleChange(index, e)}
            />
            <input
              name='series'
              placeholder='Series'
              value={input.series}
              onChange={(e) => handleChange(index, e)}
            />
            <input
              name='reps'
              placeholder='Repeticiones'
              value={input.reps}
              onChange={(e) => handleChange(index, e)}
            />
          </div>
        );
      })}
      <button onClick={addExercises}>Añadir ejercicios</button>
      <button onClick={send}>Ver ejercicios</button>
      <button onClick={handleAdd}>Add to firebase</button>
    </div>
  );
};

export default exercisesForm;
