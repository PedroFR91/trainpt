// components/trainer/PendingRequests.js

import React, { useState, useEffect, useContext } from 'react';
import { List, Avatar, Button, message, notification } from 'antd'; // Importar notification correctamente
import { getDocs, collection, query, where, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';

const PendingRequests = () => {
    const { myUid } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const subscriptionsRef = collection(db, 'subscriptions');
                const q = query(subscriptionsRef, where('trainerId', '==', myUid), where('status', '==', 'pending'));
                const querySnapshot = await getDocs(q);
                const requestsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setRequests(requestsData);
            } catch (error) {
                console.error('Error al obtener solicitudes pendientes:', error);
                message.error('No se pudieron cargar las solicitudes pendientes.');
            }
        };

        fetchRequests();
    }, [myUid]);

    const handleAcceptRequest = async (requestId, clientId) => {
        try {
            // Actualizar el estado de la solicitud a "active"
            const requestRef = doc(db, 'subscriptions', requestId);
            await updateDoc(requestRef, {
                status: 'active',
                acceptedAt: new Date(),
            });

            // Asignar formulario inicial al cliente
            await assignInitialForm(clientId);

            notification.success({
                message: 'Solicitud aceptada',
                description: 'El formulario inicial ha sido asignado correctamente.',
            });

            // Actualizar la lista de solicitudes pendientes
            setRequests(requests.filter((req) => req.id !== requestId));
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
            message.error('Error al aceptar la solicitud.');
        }
    };

    const assignInitialForm = async (clientId) => {
        try {
            // Obtener el formulario inicial base
            const baseFormRef = doc(db, 'forms', 'base-initial');
            const baseFormSnapshot = await getDoc(baseFormRef);

            if (baseFormSnapshot.exists()) {
                const formData = { ...baseFormSnapshot.data(), clientId };
                const newFormRef = doc(collection(db, 'clients', clientId, 'forms'));
                await setDoc(newFormRef, formData);
                console.log('Formulario inicial asignado correctamente');
            } else {
                console.error('No se encontró el formulario base');
            }
        } catch (error) {
            console.error('Error al asignar formulario inicial:', error);
        }
    };

    return (
        <List
            itemLayout="horizontal"
            dataSource={requests}
            renderItem={(request) => (
                <List.Item
                    actions={[
                        <Button
                            type="primary"
                            onClick={() => handleAcceptRequest(request.id, request.clientId)}
                        >
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
