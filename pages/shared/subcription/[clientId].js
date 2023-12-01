import React, { useContext, useEffect, useState } from "react";
import { query, collection, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useRouter } from 'next/router';
import AuthContext from '../../../context/AuthContext';
import styles from './subcription.module.css';
import Link from "next/link";
import { Button } from "@mui/material";
import TrainerHeader from '../../../components/trainer/trainerHeader'
import Form from '../../../components/forms/form'
const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true); // Estado para manejar la carga
    const [trainer, setTrainer] = useState(null);
    const router = useRouter();
    const { clientId } = router.query;
    const { user, myData } = useContext(AuthContext); // Asume que AuthContext proporciona un objeto de usuario
    const [currentUser, setCurrentUser] = useState(null);

    const trainerSubscriptionStatus = [
        {
            step: 'previous',
            description: 'Un cliente ha solicitado tus servicios',
            button: <button onClick={() => handleUpdateStatus('form')}>Aceptar Petición</button>,
            section: <Link href={'/trainer/forms'}>Selecciona el formulario inicial que deseas enviarle</Link>
        },
        {
            step: 'form',
            description: 'Pendiente respuesta formulario',
            button: <button onClick={() => handleUpdateStatus('revision')}>Enviar Formulario Inicial</button>,
            section: '',
        },
        {
            step: 'revision',
            description: 'Pendiente de recibir revisión',
            button: <button onClick={() => handleUpdateStatus('complete')}>Completar Revisión</button>,
            section: <div>REVISION</div>
        },
        {
            step: 'complete',
            description: 'Completo',
            button: <span>Revisión Completa</span>,
            section: <div>{new Date().toLocaleDateString()}</div>
        },
    ];

    // Estados de la suscripción para el cliente
    const clientSubscriptionStatus = [
        {
            step: 'previous',
            description: 'Esperando a tu entrenador',

        },
        {
            step: 'form',
            description: 'Pendiente de completar formulario',
            button: <a href='/formulario-inicial'>Ir al formulario inicial</a>,
        },
        {
            step: 'revision',
            description: 'Pendiente de enviar revisión',
            button: <a href='/mis-archivos'>Ver mis archivos</a>,
        },
        {
            step: 'complete',
            description: 'Completo',
            button: <a href={`/chat/chat`}>Ir al chat con el entrenador</a>,
        },
    ];

    useEffect(() => {

        setCurrentUser(user || myData);


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
        if (subscription && subscription.trainerId) {
            const trainerRef = doc(db, 'users', subscription.trainerId);
            getDoc(trainerRef).then(docSnap => {
                if (docSnap.exists()) {
                    setTrainer(docSnap.data());
                } else {
                    console.error("No se encontró el entrenador:", subscription.trainerId);
                }
            }).catch(error => {
                console.error("Error al obtener los datos del entrenador:", error);
            });
        }
    }, [user, myData, subscription, clientId, router.isReady]);

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
                status: nextStatus, // Actualiza al siguiente estado
                Initialform: 'Gkpw4Rpsce5lcA70W825'
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

    const stepsToShow = currentUser?.role === 'client' ? clientSubscriptionStatus : trainerSubscriptionStatus;

    return (
        <>
            <TrainerHeader />
            <div className={styles.subscription}>
                {subscription ? (
                    <div>
                        <h1>Hola, {myData?.username}. Desde aquí puedes comprobar el estado de tu suscripción.</h1>
                        {currentUser?.role === 'client' && <h1>Has seleccionado como entrenador a  {trainer?.username} </h1>}
                        <div>
                            <button>
                                <Link href={`/shared/trainers/${trainer?.id}`}>Ver perfil</Link>
                            </button>
                            <button><Link href={'/chat/chat'}>Ir al chat</Link></button>
                        </div>

                        <ul className={styles.subscriptionSteps}>
                            {stepsToShow?.map(({ step, description, button, section }) => (
                                <li key={step} className={getStatusClassName(step)}>
                                    <p>{description}</p>
                                    {subscription.status === step && button}
                                    {subscription.status === step && section}

                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div>No se encontró la suscripción para el cliente: {clientId}</div>
                )}
            </div>
        </>
    );
};

export default Subscription;
