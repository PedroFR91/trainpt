import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/program.module.css';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
const trainersList = (props) => {
  const [data, setData] = useState([]);
  const [select, setSelect] = useState('');
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
    const docRef = doc(db, 'users', myUid);
    await updateDoc(docRef, {
      link: id,
    });
  };

  const hide = () => {};
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
            <div
              className={styles.button}
              onClick={() => {
                hide();
                selectTrainer(data.id);
              }}
            >
              Seleccionar
            </div>
          </div>
        ))}
      <div></div>
    </div>
  );
};

export default trainersList;
