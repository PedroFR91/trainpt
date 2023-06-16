import {
  serverTimestamp,
  setDoc,
  doc,
  onSnapshot,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';

import { db } from '../../firebase.config';
import styles from '../../styles/routines.module.css';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';

import { FaRunning, FaCalendarDay, FaDumbbell, FaList } from 'react-icons/fa';

const routine = () => {
  const [data, setData] = useState(['']);
  const [exercises, setExercises] = useState([]);
  const [newexercise, setNewExercise] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routinesList, setRoutinesList] = useState(false);
  const [trainingsList, setTrainingsList] = useState(false);
  const [exercisesList, setExercisesList] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [trainingData, setTrainingData] = useState({
    name: '',
    description: '',
    exercises: [],
  });

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'routines'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRoutines(list);
      },
      (error) => {
        console.log(error);
      }
    );

    const unsubExercises = onSnapshot(
      collection(db, 'exercises'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setExercises(list);
      },
      (error) => {
        console.log(error);
      }
    );

    const unsubTrainings = onSnapshot(
      collection(db, 'trainings'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setTrainings(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
      unsubExercises();
      unsubTrainings();
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log(data);
    try {
      await addDoc(collection(db, 'routines'), {
        ...data,
        trainerid: user.uid,
        timeStamp: serverTimestamp(),
        trainings: selectedTrainings,
        days: selectedDays,
      });
      setSelectedTrainings([]);
      setSelectedDays([]);
    } catch (error) {
      console.log(error);
    }
  };

  // Para crear entrenamientos
  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'trainings'), {
        name: trainingData.name,
        description: trainingData.description,
        timeStamp: serverTimestamp(),
        exercises: trainingData.exercises,
      });
      setSelectedExercises([]);
      console.log(trainingData);
    } catch (error) {
      console.log(error);
    }
  };

  // Para crear ejercicios
  const handleCreateExercise = async (e) => {
    console.log(newexercise);
    try {
      await addDoc(collection(db, 'exercises'), {
        exercise_name: newexercise.exercise_name,
        material: newexercise.material,
        comments: newexercise.comments,

        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAssignExercise = async (e, trainingId) => {
    e.preventDefault();
    const exerciseId = e.target.value; // Aquí asumo que el id del ejercicio se encuentra en el valor del botón
    try {
      const exerciseRef = doc(db, 'exercises', exerciseId);
      const trainingRef = doc(db, 'trainings', trainingId);
      const trainingData = (await getDoc(trainingRef)).data();

      const updatedTraining = {
        ...trainingData,
        exercises: [...trainingData.exercises, { ...exerciseRef }],
      };

      await setDoc(trainingRef, updatedTraining);
    } catch (error) {
      console.error('Error al asignar el ejercicio al entrenamiento: ', error);
    }
  };

  const handleAssignTraining = async (e, routineId) => {
    e.preventDefault();
    const trainingId = e.target.value; // Aquí asumo que el id del entrenamiento se encuentra en el valor del botón
    try {
      const trainingRef = doc(db, 'trainings', trainingId);
      const routineRef = doc(db, 'routines', routineId);
      const routineData = (await getDoc(routineRef)).data();

      const updatedRoutine = {
        ...routineData,
        trainings: [...routineData.trainings, { ...trainingRef }],
      };

      await setDoc(routineRef, updatedRoutine);
    } catch (error) {
      console.error('Error al asignar el entrenamiento a la rutina: ', error);
    }
  };

  const asignRoutine = (id) => {
    setShowClient(true);
    setCurrentRoutine(id);
  };
  const selectTrainer = async (cr, id) => {
    console.log('id', id);
    console.log('MyUid', myUid);
    await updateDoc(doc(db, 'routines', cr), {
      link: id,
    });
    setShowClient(false);
  };
  const handleView = (id) => {
    setVisible(true);
    setRoutineId(id); // Guarde el ID de la rutina seleccionada en el estado
  };

  //Modales
  const handleShowExerciseModal = () => {
    setShowExerciseModal(true);
  };
  const handleCloseExerciseModal = () => {
    setShowExerciseModal(false);
    // Restablece cualquier estado relacionado con el modal de ejercicio aquí
  };
  const handleShowTrainingModal = () => {
    setShowTrainingModal(true);
  };

  const handleCloseTrainingModal = () => {
    setShowTrainingModal(false);
    // Restablece cualquier estado relacionado con el modal de entrenamiento aquí
  };

  const handleAddExerciseToTraining = (exerciseId, checked) => {
    if (checked) {
      setTrainingData((prevData) => ({
        ...prevData,
        exercises: [...prevData.exercises, exerciseId],
      }));
    } else {
      setTrainingData((prevData) => ({
        ...prevData,
        exercises: prevData.exercises.filter((id) => id !== exerciseId),
      }));
    }
  };

  const handleShowRoutineModal = () => {
    setShowRoutineModal(true);
  };

  const handleCloseRoutineModal = () => {
    setShowRoutineModal(false);
    // Restablece cualquier estado relacionado con el modal de rutina aquí
  };

  const handleAddTrainingToRoutine = (trainingId) => {
    setSelectedTrainings([...selectedTrainings, trainingId]);
  };

  const handleSelectDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(
        selectedDays.filter((selectedDay) => selectedDay !== day)
      );
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };
  const viewRoutinesList = () => {
    setRoutinesList(true);
    setTrainingsList(false);
    setExercisesList(false);
  };
  const viewTrainingList = () => {
    setRoutinesList(false);
    setTrainingsList(true);
    setExercisesList(false);
  };
  const viewExercisesList = () => {
    setRoutinesList(false);
    setTrainingsList(false);
    setExercisesList(true);
  };
  return (
    <div className={styles.routinesContainer}>
      <div className={styles.editor}>
        <div className={styles.top}>
          <div onClick={handleShowRoutineModal} className={styles.routine}>
            <FaCalendarDay size={50} />
            <p>Crear Rutina</p>
          </div>
          <div onClick={handleShowTrainingModal} className={styles.routine}>
            <FaRunning size={50} />
            <p>Crear Entrenamiento</p>
          </div>
          <div onClick={handleShowExerciseModal} className={styles.routine}>
            <FaDumbbell size={50} />
            <p>Crear Ejercicio</p>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.selectmenu}>
            <div onClick={viewRoutinesList}>Ver Mis Rutinas</div>
            <div onClick={viewTrainingList}>Ver Mis Entrenamientos</div>
            <div onClick={viewExercisesList}>Ver Mis Ejercicios</div>
          </div>
          <div className={styles.myddbb}>
            {routinesList && (
              <div className={styles.myddbbitem}>
                <h3>Mis Rutinas</h3>
                {routines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={(e) => handleAssignTraining(e, routine.id)}
                  >
                    Asignar Rutina
                  </button>
                ))}
              </div>
            )}
            {trainingsList && (
              <div className={styles.myddbbitem}>
                <h3>Mis entrenamientos</h3>

                {trainings.map((training) => (
                  <button
                    key={training.id}
                    onClick={(e) => handleAssignTraining(e, training.id)}
                  >
                    Asignar Entrenamiento
                  </button>
                ))}
              </div>
            )}
            {exercisesList && (
              <div className={styles.myddbbitem}>
                <h3>Mis ejercicios</h3>
                <table>
                  <tr>
                    <th>Nombre</th>
                    <th>Material usado</th>
                    <th>Comentarios</th>
                  </tr>
                  {exercises.map((exercise) => (
                    <tr key={exercise} className={styles.exercise}>
                      <td>{exercise.exercise_name}</td>
                      <td>{exercise.material}</td>
                      <td>{exercise.comments}</td>
                    </tr>
                  ))}
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {showExerciseModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <FaDumbbell size={50} />
            <form onSubmit={handleCreateExercise}>
              <div>
                <p>Ejercicio:</p>
                <input
                  type='text'
                  value={newexercise.exercise_name}
                  onChange={(e) =>
                    setNewExercise({
                      ...newexercise,
                      exercise_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <p>Material necesario:</p>

                <input
                  type='text'
                  value={newexercise.material}
                  onChange={(e) =>
                    setNewExercise({
                      ...newexercise,
                      material: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <p>Comentarios:</p>
                <textarea
                  type='text'
                  value={newexercise.comments}
                  onChange={(e) =>
                    setNewExercise({
                      ...newexercise,
                      comments: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.create} onClick={handleCreateExercise}>
                Crear Ejercicio
              </div>
            </form>
            <div
              className={styles.closebutton}
              onClick={handleCloseExerciseModal}
            >
              X
            </div>
          </div>
        </div>
      )}
      {showTrainingModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <form onSubmit={handleCreateTraining}>
              <div>
                <p>Entrenamiento:</p>
                <input
                  type='text'
                  value={trainingData.name}
                  onChange={(e) =>
                    setTrainingData({ ...trainingData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <p>Descripción:</p>

                <input
                  type='text'
                  value={trainingData.description}
                  onChange={(e) =>
                    setTrainingData({
                      ...trainingData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.create} onClick={handleCreateTraining}>
                Crear Entrenamiento
              </div>
            </form>
            <div
              className={styles.closebutton}
              onClick={handleCloseTrainingModal}
            >
              X
            </div>
            <h3>Mis ejercicios</h3>
            {exercises.map((exercise) => (
              <div key={exercise.exercise_name}>
                <p>{exercise.exercise_name}</p>
                <p>{exercise.material}</p>
                <p>{exercise.comments}</p>
                <button
                  key={exercise.id}
                  onClick={(e) => handleAssignExercise(e, exercise.id)}
                >
                  Asignar Ejercicio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showRoutineModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <form onSubmit={handleCreate}>
              <div>
                <p>Descripción:</p>
                <input
                  type='text'
                  value={data.desroutine}
                  onChange={(e) =>
                    setData({ ...data, desroutine: e.target.value })
                  }
                />
              </div>
              <h3>Entrenamientos</h3>
              {trainings.map((training) => (
                <div key={training.id}>
                  <input
                    type='checkbox'
                    id={training.id}
                    value={training.id}
                    onChange={(e) => handleAddTrainingToRoutine(e.target.value)}
                  />
                  <label htmlFor={training.id}>{training.name}</label>
                </div>
              ))}
              <h3>Días</h3>
              <div className={styles.myweek}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className={styles.myday}>
                    <input
                      type='checkbox'
                      id={day}
                      value={day}
                      onChange={(e) => handleSelectDay(e.target.value)}
                    />
                    <label htmlFor={day}>{day}</label>
                  </div>
                ))}
              </div>
              <div className={styles.create} type='submit'>
                Crear Rutina
              </div>
            </form>
            <div
              className={styles.closebutton}
              onClick={handleCloseRoutineModal}
            >
              Cerrar
            </div>
          </div>
        </div>
      )}

      {showClient && (
        <div className={styles.share}>
          {myData
            .filter((data) => data.role === 'client')
            .map((data) => (
              <div
                key={data.id}
                onClick={() => selectTrainer(currentRoutine, data.id)}
              >
                <div>
                  {data.img ? (
                    <img src={data.img} alt={'myprofileimg'} />
                  ) : (
                    <img src='/face.jpg' alt={'myprofileimg'} />
                  )}
                </div>
                <p>{data.username}</p>
              </div>
            ))}
          <button onClick={() => setShowClient(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default routine;
