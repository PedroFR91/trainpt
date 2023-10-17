import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/program.module.css';
import {
  arrayUnion,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../../firebase.config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
import Link from 'next/link';
const trainersList = (props) => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [select, setSelect] = useState(false);
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
  useEffect(() => {
    const hasSelectedTrainer = data.some((trainer) => {
      // Verificar si trainer.link es un array y si contiene myUid
      return Array.isArray(trainer.link) && trainer.link.includes(myUid);
    });
    setSelect(hasSelectedTrainer);
  }, [data, myUid]);

  console.log(myData);

  const selectTrainer = async (id) => {
    const docRef = doc(db, 'users', id);
    const mydocRef = doc(db, 'users', myUid);

    await updateDoc(docRef, {
      link: arrayUnion(myUid),
      status: arrayUnion({ name: 'pendiente', id: myUid }),
      selected: true,
    });
    await updateDoc(mydocRef, {
      link: id,
      status: arrayUnion({ name: 'pendiente', id: id }),
      selected: true,
    });
  };

  const deselectTrainer = async (id) => {
    const docRef = doc(db, 'users', id);
    const mydocRef = doc(db, 'users', myUid);
    await updateDoc(docRef, {
      link: arrayRemove(myUid),
      selected: false,
    });
    await updateDoc(mydocRef, {
      link: '',
      selected: false,
      status: '',
    });
  };

  const showTrainer = () => {
    setShow(true);
  };

  return (
    <>
      {select ? (
        <div>
          <h2>Mi Entrenador</h2>
        </div>
      ) : (
        <div>
          <h2>Entrenadores Disponibles</h2>
        </div>
      )}
      <div className={styles.trainersList}>
        {select
          ? data
            .filter(
              (trainer) =>
                Array.isArray(trainer.link) && trainer.link.includes(myUid)
            )
            .map((trainer) => (
              <div key={trainer.id} className={styles.userdata}>
                <div>
                  {trainer.img ? (
                    <img src={trainer.img} alt={'myprofileimg'} />
                  ) : (
                    <img src='/face.jpg' alt={'myprofileimg'} />
                  )}
                </div>
                <div>{trainer.username}</div>
                {/* <div
                    className={`${styles.status} ${
                      trainer.status.name === 'pendiente'
                        ? styles.yellowStatus
                        : ''
                    } 
                                ${
                                  trainer.status.name === 'Inicial'
                                    ? styles.blueStatus
                                    : ''
                                } 
                                ${
                                  trainer.status.name === 'archivos'
                                    ? styles.greenStatus
                                    : ''
                                }`}
                  >
                    {trainer.status.name}
                  </div> */}

                <Link href={`/shared/trainers/${trainer.id}`}
                  className={styles.button}

                >
                  Ver Perfil
                </Link>

                <div
                  className={styles.button}
                  onClick={() => {
                    deselectTrainer(trainer.id);
                    setSelect(false);
                  }}
                >
                  Cambiar
                </div>
              </div>
            ))
          : data
            .filter((trainer) => trainer.role === 'trainer')
            .map((trainer) => (
              <div key={trainer.id} className={styles.userdata}>
                <div>
                  {trainer.img ? (
                    <img src={trainer.img} alt={'myprofileimg'} />
                  ) : (
                    <img src='/face.jpg' alt={'myprofileimg'} />
                  )}
                </div>
                <div>{trainer.username}</div>
                {!show ? (
                  <div
                    className={styles.button}
                    onClick={() => showTrainer(trainer)}
                  >
                    Ver Perfil
                  </div>
                ) : (
                  <div className={styles.trainerInfo}>INFO</div>
                )}

                <div
                  className={styles.button}
                  onClick={() => {
                    selectTrainer(trainer.id);
                    setSelect(true);
                  }}
                >
                  Seleccionar
                </div>
              </div>
            ))}
      </div>
    </>
  );
};

export default trainersList;
