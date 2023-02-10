import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/program.module.css';
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
const trainersList = (props) => {
  const [data, setData] = useState([]);
  const [select, setSelect] = useState(false);
  const [show, setShow] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const selectTrainer = async (id) => {
    console.log(id);
    console.log(myUid);
    setSelect(true);
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      link: myUid,
      selected: true,
    });
  };
  const deselectTrainer = async (id) => {
    console.log(id);
    console.log(myUid);
    setSelect(true);
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      link: '',
      selected: true,
    });
  };

  const showTrainer = () => {
    setShow(true);
  };

  return (
    <>
      {!select ? (
        <div>
          <h2>Entrenadores Disponibles</h2>
        </div>
      ) : (
        <div>
          <h2>Mi Entrenador</h2>
        </div>
      )}
      <div className={styles.trainersList}>
        {!select
          ? data
              .filter((data) => data.role === 'trainer')
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
                  {!show ? (
                    <div
                      className={styles.button}
                      onClick={() => showTrainer(data)}
                    >
                      Ver Perfil
                    </div>
                  ) : (
                    <div className={styles.trainerInfo}>INFO</div>
                  )}

                  <div
                    className={styles.button}
                    onClick={() => {
                      selectTrainer(data.id);
                      setSelect(true);
                    }}
                  >
                    Seleccionar
                  </div>
                </div>
              ))
          : data
              .filter((data) => data.role === 'trainer' && data.link === myUid)
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

                  {!show ? (
                    <div
                      className={styles.button}
                      onClick={() => showTrainer(data)}
                    >
                      Ver Perfil
                    </div>
                  ) : (
                    <div className={styles.trainerInfo}>INFO</div>
                  )}

                  <div
                    className={styles.button}
                    onClick={() => {
                      deselectTrainer(data.id);
                      setSelect(false);
                    }}
                  >
                    Cambiar
                  </div>
                </div>
              ))}
        <div></div>
      </div>
    </>
  );
};

export default trainersList;
