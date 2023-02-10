import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/rate.module.css';
import AuthContext from '../../context/AuthContext';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
const myrates = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [rates, setRates] = useState([]);
  const [view, setView] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'rates'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRates(list);
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
    const time = new Date().getTime();
    try {
      await setDoc(doc(db, 'rates', data.ratename), {
        ...data,
        rateid: myUid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }

    setData([]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'rates', id));
      setRates(rates.filter((item) => item.ratename !== id));
      console.log(rateid);
    } catch (error) {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.addrate}>
        {view ? (
          <button className={styles.add} onClick={() => setView(false)}>
            Añadir Tarifa
          </button>
        ) : (
          <>
            <input
              type='text'
              placeholder='Nombre de Tarifa'
              onChange={(e) => setData({ ...data, ratename: e.target.value })}
            />
            <input
              type='text'
              placeholder='Precio'
              onChange={(e) => setData({ ...data, rateprice: e.target.value })}
            />
            <input
              type='text'
              placeholder='Frecuencia'
              onChange={(e) => setData({ ...data, ratefre: e.target.value })}
            />
            <button
              className={styles.add}
              onClick={() => {
                handleSave();
                setView(true);
              }}
            >
              Guardar
            </button>
          </>
        )}
      </div>
      <div className={styles.rates}>
        {rates
          .filter((data) => data.rateid === myUid)
          .map((rate) => (
            <div key={rate.ratename} className={styles.rate}>
              <p>Tipo:{rate.ratename}</p>
              <p>Precio:{rate.rateprice}</p>
              <p>Frecuencia:{rate.ratefre}</p>
              <button
                onClick={() => handleDelete(rate.ratename)}
                className={styles.add}
              >
                Borrar
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default myrates;
