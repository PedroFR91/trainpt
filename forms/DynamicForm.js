import React, { useState } from 'react';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';

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
                <div key={index} >
                    <p>Repeticiones:</p>
                    <input
                        type="text"
                        name="repetitions"
                        value={exercise.repetitions}
                        onChange={(e) => { handleInputChange(index, e); }}
                    />
                    <p>Series {index + 1}</p>
                    {/* <input
                        type="text"
                        name="sets"
                        value={exercise.sets}
                        onChange={(e) => handleInputChange(index, e)}
                    /> */}
                    <button type="button" onClick={() => handleRemoveExercise(index)}>
                        <FaRegTrashAlt />
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddExercise}><FaRegEdit /></button>
        </div>
    );
}

export default DynamicForm;
