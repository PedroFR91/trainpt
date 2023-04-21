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
  const [myForm, setMyForm] = useState([]);
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
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyForm(list);
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
          .filter((data) => data.role === 'client')
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
          <div>Medidas</div>
          <div>Fotos</div>
          <div>
            <p>Formularios:</p>
            <div>
              {myForm
                .filter((form) => form.link === current.id)
                .map((form) => (
                  <div key={form.id}>
                    <p>{form.name}</p>
                  </div>
                ))}
            </div>
          </div>
          <div>Entrenamientos</div>
          <div>
            <p>Rutina asignada</p>
            <div>
              {routine
                .filter((data) => data.link === current.id)
                .map((routine) => (
                  <div key={routine.id} className={styles.routine}>
                    <div>
                      <p>
                        <span>{routine.nameroutine}</span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div>Dieta asignada</div>

          <button onClick={() => setShow(false)}>X</button>
        </div>
      )}
    </div>
  );
};

export default userList;
