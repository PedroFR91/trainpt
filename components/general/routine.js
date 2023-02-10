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

const routine = () => {
  const [data, setData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState([]);
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
  const handleChange = (index, e) => {
    let mydata = [...inputFields];
    mydata[index][e.target.name] = e.target.value;
    setInputFields(mydata);
    setData({ ...data, mydata });
  };

  const addExercises = () => {
    let newexercise = { exercise: '', series: '', reps: '' };
    setInputFields([...inputFields, newexercise]);
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

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'routines', id));
    } catch (error) {}
  };

  const handleView = () => {
    setVisible(true);
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
  return (
    <div className={styles.routinesContainer}>
      <div className={styles.routineContainer}>
        <h1 className={styles.title}>Creador de Rutinas</h1>
        <div className={styles.addroutine}>
          <input
            type='text'
            placeholder='Nombre de la Rutina'
            onChange={(e) => setData({ ...data, nameroutine: e.target.value })}
          />

          <input
            type='text'
            placeholder={data.desroutine ? data.desroutine : 'Descripción'}
            onChange={(e) => setData({ ...data, desroutine: e.target.value })}
            required
          />
          <h2>Selecciones los días de entrenamiento</h2>
          <div className={styles.week}>
            {days.map((mydata, item) => (
              <div key={item}>
                <p
                  onClick={(e) => {
                    setData({ ...data, days: mydata.day });
                    console.log(data.days);
                    console.log(data);
                  }}
                >
                  {mydata.day}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.addtraining}>
          <input
            type='text'
            placeholder='Nombre del entrenamiento'
            onChange={(e) => setData({ ...data, nametrain: e.target.value })}
          />

          <input
            type='text'
            placeholder={data.destrain ? data.destrain : 'Descripción'}
            onChange={(e) => setData({ ...data, destrain: e.target.value })}
            required
          />

          <input
            type='text'
            placeholder='Músculos trabajados'
            onChange={(e) => setData({ ...data, muscles: e.target.value })}
          />
        </div>
        <div className={styles.exercises}>
          {inputFields.map((input, index) => {
            return (
              <div key={index}>
                <div>
                  <div>
                    <input
                      name='exercise'
                      placeholder='Ejercicio'
                      value={input.exercise}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </div>
                  <div className={styles.second}>
                    <input
                      name='series'
                      placeholder='Series'
                      value={input.series}
                      onChange={(e) => handleChange(index, e)}
                    />
                    <input
                      name='reps'
                      placeholder='Repeticiones'
                      value={input.reps}
                      onChange={(e) => handleChange(index, e)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div>
            <button onClick={handleCreate}>Crear Rutina</button>
            <button onClick={addExercises} className={styles.plus}>
              Añadir ejercicio
            </button>
          </div>
        </div>
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
              </div>
              <div>
                {routine.mydata.map((e, i) => (
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
      {/* {showClient && (
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
      )} */}
    </div>
  );
};

export default routine;
