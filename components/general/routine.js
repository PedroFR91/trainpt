import {
  serverTimestamp,
  setDoc,
  doc,
  onSnapshot,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase.config';
import styles from '../../styles/routines.module.css';
import { getAuth } from 'firebase/auth';

const routine = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState([]);
  const [routine, setRoutine] = useState([]);
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

  const handleSave = async (e) => {
    try {
      await setDoc(doc(db, 'routines', data.desroutine), {
        ...data,
        routineid: user.uid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
    console.log(user.uid);
    setStep(1);
    setData([]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'routines', id));
    } catch (error) {}
  };

  return (
    <>
      <div className={styles.routineContainer}>
        <h1>Crear Nueva Rutina</h1>
        {step === 1 && (
          <div>
            <input
              type='text'
              placeholder={
                data.desroutine ? data.desroutine : 'Descripción de la rutina'
              }
              onChange={(e) => setData({ ...data, desroutine: e.target.value })}
              required
            />
            <input
              type='text'
              placeholder='Nombre de la rutina'
              onChange={(e) =>
                setData({ ...data, nameroutine: e.target.value })
              }
            />
            <input
              type='text'
              placeholder='Músculos trabajados'
              onChange={(e) => setData({ ...data, muscles: e.target.value })}
            />
            <button onClick={() => setStep(2)}>Añadir ejercicios</button>
            <span>1/3</span>
          </div>
        )}
        {step === 2 && (
          <div>
            <input
              type='text'
              placeholder='Ejercicio'
              onChange={(e) => setData({ ...data, exercises: e.target.value })}
            />
            <input
              type='text'
              placeholder='Series'
              onChange={(e) => setData({ ...data, sets: e.target.value })}
            />
            <input
              type='text'
              placeholder='Repeticiones'
              onChange={(e) => setData({ ...data, reps: e.target.value })}
            />
            <button onClick={() => setStep(1)}>Definir Rutina</button>
            <button onClick={() => setStep(3)}>Añadir Superset</button>

            <span>2/3</span>
          </div>
        )}
        {step === 3 && (
          <div>
            <input type='text' placeholder='Descripción de la rutina' />
            <input type='text' placeholder='Nombre de la rutina' />
            <input type='text' placeholder='Músculos trabajados' />
            <button onClick={() => setStep(2)}>Definir Ejercicios</button>
            <button onClick={handleSave}>Guardar Rutina</button>
            <span>3/3</span>
          </div>
        )}
      </div>
      <div className={styles.listRoutines}>
        {routine.map((routine) => (
          <div key={routine.id} className={styles.routine}>
            <p>Nombre Rutina:{routine.nameroutine}</p>
            <p>Descripción Rutina:{routine.desroutine}</p>
            <p>Músculos:{routine.muscles}</p>
            <p>Ejercicios:{routine.exercises}</p>
            <p>Series:{routine.sets}</p>
            <p>Repeticiones:{routine.reps}</p>
            <button onClick={() => handleDelete(routine.id)}>X</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default routine;
