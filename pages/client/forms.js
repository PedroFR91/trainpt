import { collection, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/clientForms.module.css';
const forms = () => {
  const [form, setForm] = useState([]);
  const { myData, myUid } = useContext(AuthContext);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setForm(list);
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
      <div className={styles.myforms}>
        {form
          .filter((data) => data.link === myUid)
          .map((form) => (
            <div key={form.id}>
              <p>
                <span>Nombre:</span> <span>{form.name}</span>
              </p>
              <p>
                <span>Sexo:</span> <span>{form.gender}</span>
              </p>
              <p>
                <span>Peso:</span> <span>{form.weight}</span>
              </p>
              <p>
                <span>Altura:</span> <span>{form.height}</span>
              </p>
              <p>Medidas</p>
              <p>
                <span>Pecho:</span> <span>{form.measures.chest}</span>
              </p>
              <p>
                <span>Hombro:</span> <span>{form.measures.shoulders}</span>
              </p>
              <p>
                <span>Biceps:</span> <span>{form.measures.biceps}</span>
              </p>
              <p>
                <span>Cintura:</span> <span>{form.measures.hips}</span>
              </p>
              <p>
                <span>Abdomen:</span> <span>{form.measures.abdomen}</span>
              </p>
              <p>
                <span>Cuadriceps:</span> <span>{form.measures.cuadriceps}</span>
              </p>
              <p>
                <span>Gemelos:</span> <span>{form.measures.gemelos}</span>
              </p>
              <p>Fotos</p>
              <p>
                <span>Frente:</span> <span>{form.photos.front}</span>
              </p>
              <p>
                <span>Espalda:</span> <span>{form.photos.back}</span>
              </p>
              <p>
                <span>Lateral:</span> <span>{form.photos.lateral}</span>
              </p>
              <p>
                <span>Intolerancias:</span> <span>{form.intolerances}</span>
              </p>
              <p>
                <span>Comida preferida:</span>{' '}
                <span>{form.preferredFoods}</span>
              </p>
              <p>
                <span>Días de entrenamiento:</span>{' '}
                <span>{form.trainingDays}</span>
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default forms;
