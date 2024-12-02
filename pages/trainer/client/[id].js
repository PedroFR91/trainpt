import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import ProgramSection from '../../../components/client/ProgramSection';
import AuthContext from '../../../context/AuthContext';
import { message, Spin } from 'antd';

const ClientProfilePage = () => {
    const router = useRouter();
    const { id } = router.query; // Obtener el ID del cliente desde la URL
    const { myUid } = useContext(AuthContext); // ID del entrenador autenticado
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !myUid) return;

        const fetchClientData = async () => {
            try {
                // Consultar la suscripción activa
                const subscriptionQuery = query(
                    collection(db, 'subscriptions'),
                    where('clientId', '==', id),
                    where('trainerId', '==', myUid),
                    where('status', '==', 'active')
                );

                const subscriptionSnapshot = await getDocs(subscriptionQuery);

                if (subscriptionSnapshot.empty) {
                    message.error('No tienes acceso a este cliente.');
                    router.push('/trainer');
                    return;
                }

                // Si la suscripción es válida, cargar los datos del cliente
                const clientRef = collection(db, 'clients');
                const clientSnapshot = await getDocs(query(clientRef, where('id', '==', id)));

                if (!clientSnapshot.empty) {
                    setClientData(clientSnapshot.docs[0].data());
                } else {
                    message.error('Cliente no encontrado.');
                }
            } catch (error) {
                console.error('Error al cargar los datos del cliente:', error);
                message.error('Error al cargar los datos del cliente.');
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [id, myUid]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return clientData ? (
        <ProgramSection clientData={clientData} />
    ) : (
        <p>No se pudo cargar el perfil del cliente.</p>
    );
};

export default ClientProfilePage;
