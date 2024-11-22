// components/trainer/PendingRequests.js

import React, { useState, useEffect, useContext } from 'react';
import { List, Avatar, Button, message } from 'antd';
import { getDocs, collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';

const PendingRequests = () => {
    const { myUid } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            const subscriptionsRef = collection(db, 'subscriptions');
            const q = query(subscriptionsRef, where('trainerId', '==', myUid), where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const requestsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setRequests(requestsData);
        };

        fetchRequests();
    }, [myUid]);

    const handleAcceptRequest = async (requestId) => {
        try {
            const requestRef = doc(db, 'subscriptions', requestId);
            await updateDoc(requestRef, {
                status: 'active',
                acceptedAt: new Date(),
            });
            await assignInitialForm(clientId);

            notification.success({ message: 'Solicitud aceptada y formulario inicial asignado' });
            setRequests(requests.filter((req) => req.id !== requestId));
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
            message.error('Error al aceptar la solicitud.');
        }
    };
    const assignInitialForm = async (clientId) => {
        try {
            const trainerId = myUid; // Asegúrate de que myUid es el ID del entrenador

            // Obtener el formulario inicial del entrenador
            const initialFormSnapshot = await getDocs(
                query(
                    collection(db, `trainers/${trainerId}/forms`),
                    where('type', '==', 'initial')
                )
            );

            if (initialFormSnapshot.empty) {
                console.error('No se encontró ningún formulario inicial');
                return;
            }

            // Suponiendo que solo tienes un formulario inicial
            const initialFormDoc = initialFormSnapshot.docs[0];
            const initialFormData = initialFormDoc.data();

            // Asignar el formulario al cliente
            await addDoc(collection(db, `clients/${clientId}/assignedForms`), {
                formId: initialFormDoc.id,
                trainerId: trainerId,
                assignedAt: serverTimestamp(),
                status: 'pending',
                type: 'initial',
            });
        } catch (error) {
            console.error('Error al asignar el formulario inicial:', error);
        }
    };
    return (
        <List
            itemLayout="horizontal"
            dataSource={requests}
            renderItem={(request) => (
                <List.Item
                    actions={[
                        <Button type="primary" onClick={() => handleAcceptRequest(request.id)}>
                            Aceptar
                        </Button>,
                    ]}
                >
                    <List.Item.Meta
                        title={`Cliente ID: ${request.clientId}`}
                        description={`Solicitud enviada el ${request.createdAt.toDate().toLocaleString()}`}
                    />
                </List.Item>
            )}
        />
    );
};

export default PendingRequests;
