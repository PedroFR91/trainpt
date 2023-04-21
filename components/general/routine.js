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

import Step1 from '../Steps/Step1';
import Step2 from '../Steps/Step2';
import Step3 from '../Steps/Step3';
import Step4 from '../Steps/Step4';
import { db } from '../../firebase.config';
import styles from '../../styles/routines.module.css';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
import RoutineDetails from './RoutineDetails';
import { FaRunning, FaCalendarDay, FaDumbbell, FaList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAnimation, AnimatePresence } from 'framer-motion';

const routine = () => {
  const [data, setData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [step, setStep] = useState(1);
  const [currentRoutine, setCurrentRoutine] = useState(null);

  const animation = useAnimation();

  useEffect(() => {
    const stepsVariants = {
      step1: { x: 0, opacity: 1 },
      step2: { x: 100, opacity: 0 },
      step3: { x: 200, opacity: 0 },
      step4: { x: 300, opacity: 0 },
    };

    const transition = {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    };

    animation.start({ ...stepsVariants[`step${step}`], transition });
  }, [step]);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const auth = getAuth();
  const user = auth.currentUser;
  const [inputFields, setInputFields] = useState([
    { exercise: '', series: '', reps: '' },
  ]);
  const [days, setDays] = useState([
    {
      id: '0',
      day: 'Día 1',
    },
    {
      id: '1',
      day: 'Día 2',
    },
    {
      id: '2',
      day: 'Día 3',
    },
    {
      id: '3',
      day: 'Día 4',
    },
    {
      id: '4',
      day: 'Día 5',
    },
    {
      id: '5',
      day: 'Día 6',
    },
    {
      id: '6',
      day: 'Día 7',
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
    const unsub = onSnapshot(
      collection(db, 'routines'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRoutine(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleCreate = async (e) => {
    try {
      await setDoc(doc(db, 'routines', data.desroutine), {
        ...data,
        routineid: user.uid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
    setInputFields([{ exercise: '', series: '', reps: '' }]);
  };

  const handleCreateTraining = async (e) => {
    try {
      await setDoc(doc(db, 'training', data.nametrain), {
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
      <div className={styles.iconContainer}>
        <FaRunning
          className={step === 1 ? styles.activeIcon : styles.inactiveIcon}
        />
        <FaCalendarDay
          className={step === 2 ? styles.activeIcon : styles.inactiveIcon}
        />
        <FaDumbbell
          className={step === 3 ? styles.activeIcon : styles.inactiveIcon}
        />
        <FaList
          className={step === 4 ? styles.activeIcon : styles.inactiveIcon}
        />
      </div>
      <div className={styles.mySteps}>
        <AnimatePresence mode='wait'>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Step1 setData={setData} data={data} nextStep={nextStep} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Step2
                data={data}
                days={days}
                handleSelectDay={handleSelectDay}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Step3
                data={data}
                setData={setData}
                inputFields={inputFields}
                setInputFields={setInputFields}
                handleChange={handleChange}
                addTraining={addTraining}
                nextStep={nextStep}
                prevStep={prevStep}
              />
            </motion.div>
          )}
          {step === 4 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Step4
                  data={data}
                  inputFields={inputFields}
                  setInputFields={setInputFields}
                  handleChange={handleChange}
                  addExercises={addExercises}
                  handleCreate={handleCreate}
                  prevStep={prevStep}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.listRoutines}>
        {visible && <RoutineDetails routineId={routineId} />}
      </div>
      <div className={styles.listRoutines}>
        {routine
          .filter((data) => data.routineid === myUid)
          .map((routine) => (
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
                  <span>Músculos</span>
                  <span>{routine.muscles}</span>
                </p>
                <p>
                  <span>Días de entrenamiento</span>
                  <span>{routine.days}</span>
                </p>
              </div>
              <div>
                {routine.mydata &&
                  routine.mydata.map((e, i) => (
                    <div key={i} className={styles.exer}>
                      <div>
                        <p>Ejercicio:{e.exercise}</p>
                      </div>
                      <div>
                        <p>Repeticiones:{e.reps}</p>
                        <p>Series:{e.series}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <div>
                <button onClick={() => handleDelete(routine.id)}>Borrar</button>
                <button onClick={() => asignRoutine(routine.id)}>
                  Asignar Rutina
                </button>
              </div>
            </div>
          ))}
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
