import { collection, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import styles from '../../styles/train.module.css';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
const train = () => {
  const [routine, setRoutine] = useState([]);
  const { myData, myUid } = useContext(AuthContext);

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

  return (
    <div>
      <ClientHeader />
      <div className={styles.myRoutine}>
        {routine
          .filter((data) => data.link === myUid)
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
            </div>
          ))}
      </div>
    </div>
  );
};

export default train;
