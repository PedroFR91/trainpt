import React, { useContext, useEffect, useState } from "react";
import { query, collection, where, getDocs, doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useRouter } from 'next/router';
import AuthContext from '../../../context/AuthContext';
import styles from './subcription.module.css';
import Link from "next/link";
import { Button } from "@mui/material";
import TrainerHeader from '../../../components/trainer/trainerHeader'
import Form from '../../../components/forms/form'
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { BsFillShareFill } from "react-icons/bs";
import MyRoutines from "../../../components/general/myroutines";
const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trainer, setTrainer] = useState(null);
    const router = useRouter();
    const { clientId } = router.query;
    const { myData } = useContext(AuthContext);
    const [currentUser, setCurrentUser] = useState(null);
    const [myForm, setMyForm] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [initialFormDetails, setInitialFormDetails] = useState(null);
    const startDate = new Date().toLocaleDateString()


    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "forms"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    let data = doc.data();
                    if (data.trainerId === subscription?.trainerId) {
                        list.push({ id: doc.id, ...data });
                    }
                });
                setMyForm(list);
            },
            (error) => {
                console.log(error);
            }
        );
        return () => {
            unsub();
        };
    }, [subscription]);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "routines"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setRoutines(list);
            },
            (error) => {
                console.log(error);
            }
        );
        return () => {
            unsub();

        };
    }, []);

    const trainerSubscriptionStatus = [
        {
            step: 'previous',
            description: 'Un cliente ha solicitado tus servicios',
            button: <button onClick={() => handleUpdateStatus('form')}>Aceptar Petición</button>,
            section: <div>Se le enviará el formulario inicial</div>
        },
        {
            step: 'form',
            description: 'Pendiente respuesta formulario',
            section: '',
        },
        {
            step: 'revision',
            description: <div>Revisa el formulario inicial y envía la rutina a tu cliente</div>,
            section: <MyRoutines />

        },
        {
            step: 'complete',
            description: <div>¡Listos para comenzar!, puedes editar la fecha de comienzo o de las revisiones desde tu calendario</div>,
            button: <span>Revisión Completa</span>,
            section: <div> <Link href={`/trainer/home?startDate=${startDate}`}>Ir al Calendario</Link></div>
        },
    ];

    // Estados de la suscripción para el cliente
    const clientSubscriptionStatus = [
        {
            step: 'previous',
            description: 'Esperando la respuesta de  tu entrenador',

        },
        {
            step: 'form',
            description: <div>Tu entrenador te ha enviado el formulario<br /> inicial para conocer algunos datos sobre ti</div>,
            section: <Link href={{ pathname: `/shared/forms/${myForm[0]?.id}`, query: { clientId: clientId } }}>Ir al formulario inicial</Link>,
            button: <button onClick={() => handleUpdateStatus('revision')}>Enviar Formulario Inicial</button>,
        },
        {
            step: 'revision',
            description: <div>El entrenador te enviará tu rutina personalizada tras revisar tu formulario inicial</div>,

        },
        {
            step: 'complete',
            description: 'Completo',
            button: <a href={`/chat/chat`}>Ir al chat con el entrenador</a>,
        },
    ];

    useEffect(() => {
        if (router.isReady && clientId) {
            const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", clientId));
            getDocs(subsQuery).then(querySnapshot => {
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    const docId = querySnapshot.docs[0].id;
                    setSubscription({ ...docData, id: docId });

                    // Obtener el formulario inicial si existe
                    if (docData.initialForm) {
                        const formRef = doc(db, 'forms', docData.initialForm);
                        getDoc(formRef).then(formSnap => {
                            if (formSnap.exists()) {
                                setInitialFormDetails(formSnap.data());
                            } else {
                                console.error("No se encontró el formulario inicial:", docData.initialForm);
                            }
                        }).catch(error => {
                            console.error("Error al obtener el formulario inicial:", error);
                        });
                    }
                } else {
                    console.error("No se encontró la suscripción para el cliente:", clientId);
                }
                setLoading(false);
            }).catch(error => {
                console.error("Error al obtener la suscripción:", error);
                setLoading(false);
            });
        }
    }, [router, clientId]);


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

    const handleSelectRoutine = async (routineId) => {
        setSelectedRoutineId(routineId);

        if (!subscription || !subscription.id) {
            console.error("No se ha definido la suscripción o el ID de la suscripción.");
            return;
        }

        // Actualizar la suscripción con el ID de la rutina
        const subscriptionRef = doc(db, 'subscriptions', subscription.id);
        try {
            await updateDoc(subscriptionRef, {
                routineId: routineId, // Actualiza con el ID de la rutina seleccionada
            });
            console.log(`Suscripción actualizada con la rutina ${routineId}.`);
        } catch (error) {
            console.error("Error al actualizar la suscripción con la rutina:", error);
        }
        handleUpdateStatus('complete')
    };

    if (loading) {
        return <div>Cargando estado de la suscripción...</div>;

    }

    const stepsToShow = myData?.role === 'client' ? clientSubscriptionStatus : trainerSubscriptionStatus;

    return (
        <>
            <TrainerHeader />
            <div className={styles.subscription}>
                {subscription ? (
                    <div>
                        <h1>Hola, {myData?.username}. Desde aquí puedes comprobar el estado de tu suscripción.</h1>
                        {myData?.role === 'client' && <h1>Has seleccionado como entrenador a  {trainer?.username} </h1>}
                        <div>
                            <button>
                                <Link href={`/shared/trainers/${trainer?.id}`}>Ver perfil</Link>
                            </button>
                            <button><Link href={'/chat/chat'}>Ir al chat</Link></button>
                        </div>

                        <ul className={styles.subscriptionSteps}>
                            {stepsToShow?.map(({ step, description, button, section }) => (
                                <li key={step} className={getStatusClassName(step)}>
                                    <h3>{description}</h3>

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
