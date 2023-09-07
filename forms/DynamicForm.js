import React, { useState } from 'react';

function DynamicForm({ tExercise, setTExercise }) {
    const [exercises, setExercises] = useState([{ repetitions: '', sets: '' }]);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const newExercises = [...exercises];
        newExercises[index][name] = value;
        setExercises(newExercises);
        // Actualiza tExercise con la nueva lista de ejercicios
        setTExercise({ ...tExercise, exercises: newExercises });
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
        <div>
            {exercises.map((exercise, index) => (
                <div key={index}>
                    <p>Repeticiones:</p>
                    <input
                        type="text"
                        name="repetitions"
                        value={exercise.repetitions}
                        onChange={(e) => { handleInputChange(index, e); }}
                    />
                    <p>Series:</p>
                    <input
                        type="text"
                        name="sets"
                        value={exercise.sets}
                        onChange={(e) => handleInputChange(index, e)}
                    />
                    <button type="button" onClick={() => handleRemoveExercise(index)}>Eliminar Ejercicio</button>
                </div>
            ))}
            <button type="button" onClick={handleAddExercise}>Agregar Ejercicio</button>
        </div>
    );
}

export default DynamicForm;
