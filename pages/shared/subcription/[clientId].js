import React, { useContext, useEffect, useState } from "react";
import { query, collection, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useRouter } from 'next/router';
import AuthContext from '../../../context/AuthContext';
import styles from './subcription.module.css';

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const router = useRouter();
    const { clientId } = router.query;
    const { user } = useContext(AuthContext); // Asume que AuthContext proporciona un objeto de usuario


    const trainerSubscriptionStatus = {
        previous: {
            description: 'Pendiente de aceptar cliente',
            button: <button onClick={() => handleUpdateStatus('form')}>Aceptar Cliente</button>,
        },
        form: {
            description: 'Pendiente respuesta formulario',
            button: <button onClick={() => handleUpdateStatus('revision')}>Enviar Formulario</button>,
        },
        revision: {
            description: 'Pendiente de recibir revisión',
            button: <button onClick={() => handleUpdateStatus('complete')}>Completar Revisión</button>,
        },
        complete: {
            description: 'Completo',
            button: <span>Revisión Completa</span>,
        },
    };

    // Estados de la suscripción para el cliente
    const clientSubscriptionStatus = {
        form: {
            description: 'Pendiente de completar formulario',
            button: <a href='/formulario-inicial'>Ir al formulario inicial</a>,
        },
        revision: {
            description: 'Pendiente de enviar revisión',
            button: <a href='/mis-archivos'>Ver mis archivos</a>,
        },
        complete: {
            description: 'Completo',
            button: <a href={`/chat/chat`}>Ir al chat con el entrenador</a>,
        },
    };
    +
        useEffect(() => {
            if (router.isReady && clientId) {
                const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", clientId));
                getDocs(subsQuery).then(querySnapshot => {
                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data();
                        const docId = querySnapshot.docs[0].id; // Aquí capturas el ID del documento
                        setSubscription({ ...docData, id: docId }); // Guarda los datos de la suscripción y el ID del documento en el estado
                    } else {
                        console.error("No se encontró la suscripción para el cliente:", clientId);
                    }
                    setLoading(false);
                }).catch(error => {
                    console.error("Error al obtener la suscripción:", error);
                    setLoading(false);
                });
            }
        }, [clientId, router.isReady]);

    const getStatusClassName = (statusKey) => {
        // Si no hay suscripción o el estado de la suscripción es indefinido, se aplica el estilo por defecto
        if (!subscription || !subscription.status) return styles.defaultStatus;

        // Si el estado actual coincide con el estado del paso, se aplica el estilo 'currentStatus' (naranja)
        if (subscription.status === statusKey) return styles.currentStatus;

        // Si el estado actual aún no ha alcanzado el estado del paso, se aplica el estilo 'defaultStatus' (gris)
        return styles.defaultStatus;
    };


    const handleUpdateStatus = async (nextStatus) => {
        if (!subscription || !subscription.id) return;

        const subscriptionRef = doc(db, 'subscriptions', subscription.id);

        try {
            await updateDoc(subscriptionRef, {
                status: nextStatus // Actualiza al siguiente estado
            });
            console.log(`Estado de suscripción actualizado a '${nextStatus}'.`);

            // Actualizar el estado local para reflejar el cambio inmediatamente
            setSubscription({ ...subscription, status: nextStatus });

        } catch (error) {
            console.error("Error al actualizar el estado de la suscripción:", error);
        }
    };

    if (loading) {
        return <div>Cargando estado de la suscripción...</div>;
    }

    const stepsToShow = user?.role === 'trainer' ? trainerSubscriptionStatus : clientSubscriptionStatus;

    return (
        <div className={styles.subscription}>
            {subscription ? (
                <div>
                    <h1>Estado de la Suscripción para Cliente: {clientId}</h1>
                    <h1>Entrenador: {subscription.trainerId}</h1>
                    <ul className={styles.subscriptionSteps}>
                        {Object.entries(stepsToShow).map(([key, desc]) => (
                            <li key={key} className={getStatusClassName(key)}>
                                {desc}
                                {subscription.status === key && (
                                    <>
                                        {key === 'previous' && (
                                            <button onClick={() => handleUpdateStatus('form')}>Aceptar Cliente</button>
                                        )}
                                        {key === 'form' && (
                                            <button onClick={() => handleUpdateStatus('revision')}>Enviar Formulario</button>
                                        )}
                                        {key === 'revision' && (
                                            <button onClick={() => handleUpdateStatus('complete')}>Completar Revisión</button>
                                        )}
                                        {key === 'complete' && (
                                            <span>Revisión Completa</span>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>No se encontró la suscripción para el cliente: {clientId}</div>
            )}
        </div>
    );
};

export default Subscription;
