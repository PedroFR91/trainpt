import {
  serverTimestamp,
  setDoc,
  doc,
  onSnapshot,
  collection,
  deleteDoc,
  updateDoc,
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
  const [trainings, setTrainings] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const auth = getAuth();
  const user = auth.currentUser;
  const [inputFields, setInputFields] = useState([
    { exercise: '', series: '', reps: '' },
  ]);

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
      await setDoc(doc(db, 'routines', data.desroutine), {
        ...data,
        routineid: user.uid,
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
      await setDoc(doc(db, 'trainings', data.nametrain), {
        muscles: data.muscles,
        description: data.destrain,
        trainingid: data.nametrain,
        timeStamp: serverTimestamp(),
        exercises: selectedExercises,
      });
      setSelectedExercises([]);
    } catch (error) {
      console.log(error);
    }
  };

  // Para crear ejercicios
  const handleCreateExercise = async (e) => {
    try {
      await setDoc(doc(db, 'exercises', data.nameexercise), {
        exercise: data.exercise,
        series: data.series,
        reps: data.reps,
        exerciseid: data.nameexercise,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
    setInputFields([{ exercise: '', series: '', reps: '' }]);
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

  const handleAddExerciseToTraining = (exerciseId) => {
    setSelectedExercises([...selectedExercises, exerciseId]);
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

  return (
    <div className={styles.routinesContainer}>
      <div className={styles.editor}>
        <div className={styles.left}>
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
        <div className={styles.right}>
          <div className={styles.myddbb}>
            <div className={styles.myddbbitem}>Mis rutinas</div>
            <div className={styles.myddbbitem}>Mis entrenamientos</div>
            <div className={styles.myddbbitem}>Mis ejercicios</div>
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
                  value={data.exercise}
                  onChange={(e) =>
                    setData({ ...data, exercise: e.target.value })
                  }
                />
              </div>
              <div>
                <p>Repeticiones:</p>

                <input
                  type='text'
                  value={data.reps}
                  onChange={(e) => setData({ ...data, reps: e.target.value })}
                />
              </div>
              <div>
                <p>Series:</p>
                <input
                  type='text'
                  value={data.series}
                  onChange={(e) => setData({ ...data, series: e.target.value })}
                />
              </div>
              <div className={styles.create} type='submit'>
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
                  value={data.nametrain}
                  onChange={(e) =>
                    setData({ ...data, nametrain: e.target.value })
                  }
                />
              </div>
              <div>
                <p>Descripción:</p>

                <input
                  type='text'
                  value={data.destrain}
                  onChange={(e) =>
                    setData({ ...data, destrain: e.target.value })
                  }
                />
              </div>
              <h3>Ejercicios</h3>
              {exercises.map((exercise) => (
                <div key={exercise.id}>
                  <input
                    type='checkbox'
                    id={exercise.id}
                    value={exercise.id}
                    onChange={(e) =>
                      handleAddExerciseToTraining(e.target.value)
                    }
                  />
                  <label htmlFor={exercise.id}>{exercise.name}</label>
                </div>
              ))}
              <div className={styles.create} type='submit'>
                Crear Entrenamiento
              </div>
            </form>
            <div
              className={styles.closebutton}
              onClick={handleCloseTrainingModal}
            >
              X
            </div>
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

      {exercises.map((exercise) => (
        <button
          key={exercise.id}
          onClick={(e) => handleAssignExercise(e, exercise.id)}
        >
          Asignar Ejercicio
        </button>
      ))}
      {trainings.map((training) => (
        <button
          key={training.id}
          onClick={(e) => handleAssignTraining(e, training.id)}
        >
          Asignar Entrenamiento
        </button>
      ))}
      {routines.map((routine) => (
        <button
          key={routine.id}
          onClick={(e) => handleAssignTraining(e, routine.id)}
        >
          Asignar Rutina
        </button>
      ))}

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
