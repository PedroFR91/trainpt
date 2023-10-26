import React, { useState } from 'react';
import { FaPlus, FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import styles from '../styles/routines.module.css'
function DynamicForm({ tExercise, setTExercise }) {
    const [exercises, setExercises] = useState([{ repetitions: '', sets: '' }]);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newExercises = [...exercises];
        newExercises[index][name] = value;
        setExercises(newExercises);
        // Actualiza tExercise con la nueva lista de ejercicios
        setTExercise({ ...tExercise, superset: newExercises });
        console.log(tExercise)
    };

    const handleAddExercise = () => {
        setExercises([...exercises, { repetitions: '', sets: '' }]);

    };

    const handleRemoveExercise = (index) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        setExercises(newExercises);

        // Actualiza tExercise cuando se elimina un ejercicio
        setTExercise({ ...tExercise, exercises: newExercises });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
            {exercises.map((exercise, index) => (
                <div key={index} className={styles.mydinamic}>
                    <div>
                        <p>Series {index + 1}</p>

                        <div onClick={() => handleRemoveExercise(index)} className={styles.addexercisebutton}>
                            <FaRegTrashAlt />
                        </div>
                    </div>
                    <div>
                        <p>Repeticiones:</p>
                        <input
                            type="text"
                            name="repetitions"
                            value={exercise.repetitions}
                            onChange={(e) => { handleInputChange(index, e); }}
                        />

                    </div>
                </div>
            ))}
            <button onClick={handleAddExercise} className={styles.addexercisebutton}>
                <p style={{ color: '#212121' }}>Añadir Serie</p>
                <FaPlus />
            </button>
        </div>
    );
}

export default DynamicForm;
