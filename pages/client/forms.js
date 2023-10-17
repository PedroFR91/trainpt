import { collection, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/clientForms.module.css';
import Link from 'next/link';

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
      <table className={styles.myformsTable}>
        <thead>
          <tr>
            <th>Tipo de formulario</th>
            <th>Fecha de envío</th>
            <th>Estado</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {form
            .map((formData) => (
              <tr key={formData.id} className={styles.table}>
                <td>
                  {formData.type}
                </td>
                <td>{formData.timeStamp.toDate().toLocaleString() /* Asegúrate de tener un campo fechaEnvio en tus datos */}</td>
                <td>Pendiente</td> {/* Puedes manejar el estado aquí */}
                <td><Link href={`/shared/forms/${formData.id}?clientId=${myUid}`}>
                  Rellenar
                </Link> </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default forms;
