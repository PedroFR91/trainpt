import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/program.module.css';
import { collection, onSnapshot, query, where, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import Link from 'next/link';

const TrainersList = () => {
  const [data, setData] = useState([]);
  const { myUid } = useContext(AuthContext);
  const [currentTrainerId, setCurrentTrainerId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        if (doc.data().role === 'trainer') {
          list.push({ id: doc.id, ...doc.data() });
        }
      });
      setData(list);
    }, (error) => {
      console.error(error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'subscriptions'), where('clientId', '==', myUid));
    getDocs(q).then(querySnapshot => {
      if (!querySnapshot.empty) {
        const subscriptionData = querySnapshot.docs[0].data();
        setCurrentTrainerId(subscriptionData.trainerId);
      } else {
        setCurrentTrainerId(null);
      }
    }).catch(error => {
      console.error("Error fetching subscription: ", error);
    });
  }, [myUid]);

  const selectTrainer = async (trainerId) => {
    if (currentTrainerId) {
      const confirm = window.confirm("Ya tienes un entrenador seleccionado. ¿Quieres cambiar de entrenador? Esto cancelará tu suscripción actual.");
      if (!confirm) return;
      await deselectTrainer(currentTrainerId);
    }
    const subscriptionRef = collection(db, 'subscriptions');
    await setDoc(doc(subscriptionRef), {
      clientId: myUid,
      trainerId: trainerId,
      status: "previous"
    });
    setCurrentTrainerId(trainerId);
  };

  const deselectTrainer = async (trainerId) => {
    const q = query(collection(db, 'subscriptions'), where('clientId', '==', myUid), where('trainerId', '==', trainerId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'subscriptions', document.id));
    });
    setCurrentTrainerId(null);
  };

  return (
    <div className={styles.trainersList}>
      {currentTrainerId
        ? data
          .filter((trainer) => trainer.id === currentTrainerId)
          .map((trainer) => (
            <div key={trainer.id} className={styles.userdata}>
              <Link href={`/shared/trainers/${trainer.id}`} legacyBehavior>
                {trainer.img ? (
                  <img src={trainer.img} alt={'Imagen de perfil'} />
                ) : (
                  <img src='/face.jpg' alt={'Imagen de perfil'} />
                )}
              </Link>
              <button className={styles.button} onClick={() => deselectTrainer(trainer.id)}>
                Cambiar
              </button>
            </div>
          ))
        : data.map((trainer) => (
          <div key={trainer.id} className={styles.userdata}>
            {trainer.img ? (
              <img src={trainer.img} alt={'Imagen de perfil'} />
            ) : (
              <img src='/face.jpg' alt={'Imagen de perfil'} />
            )}
            <div>{trainer.username}</div>
            <button
              style={{ backgroundColor: 'blue', color: 'white', padding: '10px', margin: '10px' }}
              onClick={() => selectTrainer(trainer.id)}
            >
              Seleccionar
            </button>
          </div>
        ))}

    </div>
  );
};

export default TrainersList;
