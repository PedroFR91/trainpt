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
import { motion } from 'framer-motion';
import { useAnimation, AnimatePresence } from 'framer-motion';

const routine = () => {
  const [data, setData] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);

  const [currentRoutine, setCurrentRoutine] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const [inputFields, setInputFields] = useState([
    { exercise: '', series: '', reps: '' },
  ]);
  const [days, setDays] = useState([
    {
      id: '0',
      day: 'L',
    },
    {
      id: '1',
      day: 'M',
    },
    {
      id: '2',
      day: 'X',
    },
    {
      id: '3',
      day: 'J',
    },
    {
      id: '4',
      day: 'V',
    },
    {
      id: '5',
      day: 'S',
    },
    {
      id: '6',
      day: 'D',
    },
  ]);
  const [sel, setSel] = useState([]);

  const handleWeek = (index, e) => {
    let myweek = [...days];
    myweek[index][e.day] = e.day;
    setInputFields(myweek);
    setData({ ...data, myweek });
  };
  const handleChange = (index, e, selectedDay) => {
    let mydata = [...inputFields];
    mydata[index][e.target.name] = e.target.value;
    setInputFields(mydata);
    setData({ ...data, [e.target.name + selectedDay + index]: e.target.value });
  };

  const addExercises = () => {
    let newexercise = { exercise: '', series: '', reps: '' };
    setInputFields([...inputFields, newexercise]);
  };
  const addTraining = () => {
    setInputFields([
      ...inputFields,
      {
        exercise: '',
        sets: '',
        reps: '',
      },
    ]);
  };

  useEffect(() => {
    const unsubRoutines = onSnapshot(collection(db, 'routines'), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRoutines(list);
    });

    const unsubTrainings = onSnapshot(
      collection(db, 'trainings'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setTrainings(list);
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
      }
    );

    return () => {
      unsubRoutines();
      unsubTrainings();
      unsubExercises();
    };
  }, []);

  // Para crear rutinas
  const handleCreate = async (e) => {
    try {
      await setDoc(doc(db, 'routines', data.desroutine), {
        ...data,
        routineid: user.uid,
        timeStamp: serverTimestamp(),
        trainings: selectedTrainings.map((training) => training.id), // Agrega las IDs de los entrenamientos seleccionados
        exercises: selectedExercises.map((exercise) => exercise.id), // Agrega las IDs de los ejercicios seleccionados
      });
    } catch (error) {
      console.log(error);
    }
    setInputFields([{ exercise: '', series: '', reps: '' }]);
  };

  // Para crear entrenamientos
  const handleCreateTraining = async (e) => {
    try {
      await setDoc(doc(db, 'trainings', data.nametrain), {
        muscles: data.muscles,
        description: data.destrain,
        trainingid: data.nametrain,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
    setInputFields([{ exercise: '', series: '', reps: '' }]);
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'routines', id));
    } catch (error) {}
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
  const handleSelectDay = (selectedDay, checked) => {
    if (checked) {
      setData({ ...data, days: [...(data.days || []), selectedDay] });
    } else {
      setData({
        ...data,
        days: data.days.filter((day) => day !== selectedDay),
      });
    }
  };
  const handleView = (id) => {
    setVisible(true);
    setRoutineId(id); // Guarde el ID de la rutina seleccionada en el estado
  };
  return (
    <div className={styles.routinesContainer}>
      <div className={styles.editor}>
        <div className={styles.left}>
          <div className={styles.routine}>
            <FaCalendarDay size={50} />
            <p>Crear Rutina</p>
          </div>
          <div className={styles.routine}>
            <FaRunning size={50} />
            <p>Crear Entrenamiento</p>
          </div>
          <div className={styles.routine}>
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
      <div className={styles.listRoutines}>
        {routines
          .filter((routine) => routine.routineid === myUid)
          .map((routine) => {
            // Busca los entrenamientos y ejercicios para esta rutina
            const routineTrainings = trainings.filter((training) =>
              routine.trainings.includes(training.id)
            );
            const routineExercises = exercises.filter((exercise) =>
              routine.exercises.includes(exercise.id)
            );

            return (
              <div key={routine.id} className={styles.routine}>
                <div>
                  <p>
                    <span>Nombre Rutina</span>
                    <span>{routine.nameroutine}</span>
                  </p>
                  <p>
                    <span>Descripción Rutina</span>
                    <span>{routine.desroutine}</span>
                  </p>
                  <p>
                    <span>Entrenamientos</span>
                    <span>
                      {routineTrainings.map((training) => (
                        <p key={training.id}>{training.name}</p>
                      ))}
                    </span>
                  </p>
                  <p>
                    <span>Ejercicios</span>
                    <span>
                      {routineExercises.map((exercise) => (
                        <p key={exercise.id}>{exercise.name}</p>
                      ))}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
      </div>

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
