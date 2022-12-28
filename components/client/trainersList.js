import React, { useState, useEffect } from 'react';
import styles from '../../styles/program.module.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
const trainersList = () => {
  const [data, setData] = useState([]);
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
  return (
    <div className={styles.trainersList}>
      {data
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
            <div className={styles.button}>Ver Perfil</div>
            <div className={styles.button}>Seleccionar</div>
          </div>
        ))}
    </div>
  );
};

export default trainersList;
