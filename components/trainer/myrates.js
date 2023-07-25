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
import Modal from './Modal';
import dynamic from 'next/dynamic';

// Importa el componente RichTextEditor de forma dinámica
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});
const myrates = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [rates, setRates] = useState([]);
  const [view, setView] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [clientSide, setClientSide] = useState(false);

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

    setClientSide(true);

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
        rateinfo: text,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }

    setData([]);
    setText('');
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'rates', id));
      setRates(rates.filter((item) => item.ratename !== id));
      console.log(rateid);
    } catch (error) {}
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setText('');
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
            <Modal
              isOpen={isModalOpen}
              closeModal={closeModal}
              className={styles.modal}
            >
              <h3>Detalles de la oferta</h3>
              {clientSide && <RichTextEditor value={text} onChange={setText} />}
              <button onClick={handleSave}>Guardar</button>
            </Modal>
            <div
              className={styles.displayText}
              dangerouslySetInnerHTML={{ __html: text }}
            ></div>
            <button onClick={openModal} className={styles.label}>
              Información
            </button>

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
              <div
                className={styles.displayTextTwo}
                dangerouslySetInnerHTML={{ __html: rate.rateinfo }}
              ></div>
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
