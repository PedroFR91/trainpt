import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import styles from '../../styles/train.module.css';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';

const Train = () => {
  const [routines, setRoutines] = useState([]);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const { myUid } = useContext(AuthContext);
  const [realRepsValues, setRealRepsValues] = useState({});
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'routines'), (snapshot) => {
      const routinesData = [];
      snapshot.forEach((doc) => {
        const routineData = doc.data();
        routineData.id = doc.id;
        routinesData.push(routineData);
      });
      setRoutines(routinesData);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  const showTraining = async (training) => {
    // Realiza una consulta para obtener los detalles completos del entrenamiento
    const trainingRef = doc(db, 'trainings', training.id);
    const trainingDoc = await getDoc(trainingRef);
    if (trainingDoc.exists()) {
      const trainingData = trainingDoc.data();
      setSelectedTraining(trainingData);
    }
  };
  const closeTraining = () => {
    setSelectedTraining(null);
  };
  const handleRealRepsChange = (e, supersetIndex, exerciseIndex) => {
    const updatedValue = e.target.value;

    // Actualiza el estado local con el nuevo valor de realReps
    setRealRepsValues((prevValues) => ({
      ...prevValues,
      [`${exerciseIndex}-${supersetIndex}`]: updatedValue,
    }));
  };
  // Agrega una función para actualizar realReps en Firebase
  const updateRealRepsInFirebase = async (supersetIndex, exerciseIndex) => {
    if (selectedTraining && selectedTraining.id) {
      // Asegúrate de que selectedTraining sea una copia actualizada
      const updatedTraining = { ...selectedTraining };
      const exercise = updatedTraining.exercises[exerciseIndex];

      // Actualiza el valor de realReps en el ejercicio
      exercise.superset[supersetIndex].realReps = realRepsValues[`${exerciseIndex}-${supersetIndex}`];

      // Actualiza el documento de entrenamiento en Firebase
      const trainingRef = doc(db, 'trainings', selectedTraining.id);
      await updateDoc(trainingRef, selectedTraining);

      // No es necesario actualizar el estado local aquí, Firebase debería reflejar los cambios en tiempo real
    }
  };
  return (
    <div className={styles.container}>

      <div className={styles.myRoutine}>

        {routines
          .filter((routine) => routine.link === myUid)
          .map((routine) => (
            <div key={routine.id} className={styles.routine}>
              <div>
                <div>
                  <p>
                    <span>Nombre Rutina:</span>
                    <span>{routine.name}</span>
                  </p>
                  <p>
                    <span>Descripción Rutina:</span>
                    <span>{routine.description}</span>
                  </p>
                </div>
                <div>
                  <p>Entrenamientos:</p>
                  <ul>
                    {routine.trainings.map((training) => (
                      <li key={training.id}>
                        <span>Nombre Entrenamiento:</span>
                        <span>{training.name}</span>
                        <button onClick={() => showTraining(training)}>Ver Entrenamiento</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                {selectedTraining && (
                  <div>
                    <h2>Entrenamiento Seleccionado: {selectedTraining.name}</h2>
                    <button onClick={closeTraining}>Cerrar Entrenamiento</button>
                    <p>Descripción: {selectedTraining.description}</p>
                    <p>Ejercicios del Entrenamiento:</p>
                    <ul>
                      {selectedTraining.exercises.map((exercise, exerciseIndex) => (
                        <li key={exerciseIndex}>
                          <span>Nombre del Ejercicio:</span>
                          <span>{exercise.name}</span>
                          <span>Descripción del Ejercicio:</span>
                          <span>{exercise.description}</span>
                          {exercise.superset && exercise.superset.length > 0 && (
                            <div>
                              <p>Supersets:</p>
                              <ul>
                                {exercise.superset.map((superset, supersetIndex) => (
                                  <li key={supersetIndex}>
                                    <span>Repetitions:</span>
                                    <span>{superset.repetitions}</span>
                                    <input
                                      type="text"
                                      value={realRepsValues[`${exerciseIndex}-${supersetIndex}`] || ""}
                                      onChange={(e) => handleRealRepsChange(e, supersetIndex, exerciseIndex)}
                                    />
                                    <button onClick={() => updateRealRepsInFirebase(supersetIndex, exerciseIndex)}>
                                      Actualizar
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                  </div>
                )}
              </div>


            </div>
          ))}


      </div>

    </div>
  );
};

export default Train;
