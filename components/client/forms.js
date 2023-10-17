import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import { db } from '../../firebase.config';
import styles from '../../styles/clientForms.module.css';
import Link from 'next/link';

const forms = ({ clientId }) => {
    const [form, setForm] = useState([]);


    useEffect(() => {
        // Define a query to retrieve documents with the matching 'clientId'
        const q = query(collection(db, 'forms'), where('clientId', '==', clientId));

        getDocs(q)
            .then((querySnapshot) => {
                const photoList = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                });
                setForm(data);
            })
            .catch((error) => {
                console.error('Error getting documents: ', error);
            });
    }, [clientId]);

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
                                <td><Link href={`/shared/forms/${formData.id}`}>
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
