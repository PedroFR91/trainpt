import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/userList.module.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
const userList = () => {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState('');
  const { myData, myUid } = useContext(AuthContext);
  const [routine, setRoutine] = useState([]);

  const showClient = (data) => {
    setShow(true);
    setCurrent(data);
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
  return (
    <div className={styles.list}>
      {!show &&
        myData
          .filter((data) => data.role === 'client' && data.link === myUid)
          .map((data) => (
            <div key={data.id} className={styles.userdata}>
              <div>
                {data.img ? (
                  <img src={data.img} alt={'myprofileimg'} />
                ) : (
                  <img src='/face.jpg' alt={'myprofileimg'} />
                )}
              </div>
              <div>{data.username}</div>
              <div>{data.status}</div>
              <div className={styles.button} onClick={() => showClient(data)}>
                Ver
              </div>
            </div>
          ))}
      {show && (
        <div className={styles.client}>
          <div>
            {' '}
            {current.img ? (
              <img src={current.img} alt={'myprofileimg'} />
            ) : (
              <img src='/face.jpg' alt={'myprofileimg'} />
            )}
          </div>
          <div>{current.username}</div>
          <div>
            <p>Rutinas:</p>
            <div>
              {' '}
              {routine
                .filter((data) => data.routineid === myUid)
                .map((routine) => (
                  <div key={routine.id} className={styles.routine}>
                    <div>
                      <p>
                        <span>{routine.nameroutine}</span>
                      </p>
                    </div>
                    <div>
                      <button onClick={() => handleDelete(routine.id)}>
                        Borrar
                      </button>
                      <button onClick={() => asignRoutine(routine.id)}>
                        Asignar Rutina
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div>
            <p>Formularios:</p>
            <div></div>
          </div>
          <div>Fotos:</div>
          <button onClick={() => setShow(false)}>X</button>
        </div>
      )}
    </div>
  );
};

export default userList;
