import React, { useState, useEffect } from 'react';
import { getRoutineData } from './firebase';

const RoutineDetails = ({ routineId }) => {
  const [routine, setRoutine] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getRoutineData(routineId);
      setRoutine(data);
    };
    fetchData();
  }, [routineId]);

  if (!routine) {
    return <div>Cargando datos de la rutina...</div>;
  }

  return (
    <div>
      <h3>Nombre rutina: {routine.nameroutine}</h3>
      <p>Descripción: {routine.desroutine}</p>
      {routine.days.map((day, index) => (
        <div key={index}>
          <h4>Entrenamiento {day}:</h4>
          <ul>
            {routine.mydata
              .filter((exercise) => exercise.day === day)
              .map((exercise, index) => (
                <li key={index}>{exercise.exercise}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default RoutineDetails;
