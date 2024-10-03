import React, { useContext, useEffect, useState } from "react";
import {
    query,
    collection,
    where,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useRouter } from "next/router";
import AuthContext from "../../../context/AuthContext";
import { Card, Button, message } from "antd";
import Chat from "../../../components/chat/chat";
import Initial from "../../../components/client/Initial";
import styles from "../../../styles/Subscription.module.css";
import Link from "next/link";

const { Meta } = Card;

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showInitialForm, setShowInitialForm] = useState(false);
    const router = useRouter();
    const { clientId } = router.query;
    const { myData } = useContext(AuthContext);
    const [myForm, setMyForm] = useState([]);
    const [routines, setRoutines] = useState([]);
    const startDate = new Date().toLocaleDateString();

    useEffect(() => {
        if (router.isReady && clientId) {
            const subsQuery = query(collection(db, "subscriptions"), where("clientId", "==", clientId));
            getDocs(subsQuery).then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const docId = querySnapshot.docs[0].id;
                    const docData = querySnapshot.docs[0].data();
                    setSubscription({ ...docData, id: docId });
                } else {
                    console.log("No se encontró una suscripción para el cliente:", clientId);
                }
                setLoading(false);
            }).catch((error) => {
                setLoading(false);
                message.error("Error obteniendo la suscripción.");
            });
        }
    }, [router, clientId]);

    const assignInitialForm = async () => {
        if (!myData?.id || !subscription?.id) {
            message.error("No se pudo cargar la información del entrenador o suscripción.");
            return;
        }

        try {
            const formQuery = query(collection(db, "forms"), where("trainerId", "==", myData.id));
            const formSnapshot = await getDocs(formQuery);

            if (!formSnapshot.empty) {
                const formId = formSnapshot.docs[0].id;
                const subscriptionRef = doc(db, "subscriptions", subscription.id);

                await updateDoc(subscriptionRef, {
                    status: "form",
                    initialForm: formId,
                });

                message.success("Petición aceptada y formulario asignado.");
                setSubscription({ ...subscription, status: "form", initialForm: formId });
            } else {
                message.error("No se encontró un formulario para asignar.");
            }
        } catch (error) {
            message.error("Hubo un problema al asignar el formulario.");
        }
    };

    const stepsToShow = [
        {
            step: "previous",
            title: "Petición de Servicios",
            description:
                myData?.role === "trainer"
                    ? "El cliente ha solicitado tus servicios. Acepta la petición para continuar."
                    : "Esperando la aceptación del entrenador.",
            action: myData?.role === "trainer" && (
                <Button type="primary" onClick={assignInitialForm}>
                    Aceptar Petición
                </Button>
            ),
        },
        {
            step: "form",
            title: "Formulario Inicial",
            description: "Por favor, completa el formulario enviado por tu entrenador.",
            action: <Button type="primary" onClick={() => setShowInitialForm(!showInitialForm)}>
                {showInitialForm ? "Cerrar Formulario" : "Ver Formulario"}
            </Button>
        },
        {
            step: "routine",
            title: "Rutina Propuesta",
            description: "Revisa la rutina personalizada enviada por tu entrenador.",
            action: (
                <Card
                    hoverable
                    style={{ width: 300 }}
                    cover={<img alt="Rutina" src="/routine.jpg" />}
                >
                    <Meta
                        title="Rutina Propuesta"
                        description={<Link href={`/trainer/routines/${routines[0]?.id}`}>Ver Rutina</Link>}
                    />
                </Card>
            )
        },
        {
            step: "complete",
            title: "Estado de la Suscripción",
            description: "Servicios contratados, precios, fechas de revisiones, etc.",
            content: (
                <ul>
                    <li>Precio: 50€ al mes</li>
                    <li>Servicios: Rutinas personalizadas, 3 revisiones al mes</li>
                    <li>Fecha de inicio: {startDate}</li>
                    <li>Próxima revisión: 15 de octubre</li>
                </ul>
            )
        }
    ];

    const currentStepIndex = stepsToShow.findIndex((step) => step.step === subscription?.status);

    if (loading || !subscription) {
        return <div>Cargando estado de la suscripción...</div>;
    }

    return (
        <div className={styles.subscriptionContainer}>
            <video className={styles.backgroundVideo} autoPlay loop muted>
                <source src="/subscription.mp4" type="video/mp4" />
            </video>

            <div className={styles.timelineSection}>
                {stepsToShow.map(({ step, title, description, action }, index) => (
                    <Card
                        key={step}
                        hoverable={index === currentStepIndex}
                        className={`${styles.timelineCard} ${index !== currentStepIndex ? styles.blurCard : ''}`}
                        style={{
                            width: "100%",
                            marginBottom: "1rem",
                            transition: "transform 0.3s ease",
                            transform: index === currentStepIndex ? "scale(1.05)" : "scale(1)",
                            opacity: index === currentStepIndex ? 1 : 0.6,
                        }}
                    >
                        <Meta
                            title={title}
                            description={description}
                            style={{ fontSize: index === currentStepIndex ? "1.2rem" : "1rem" }}
                        />
                        {index === currentStepIndex && <div className={styles.cardAction}>{action}</div>}
                    </Card>
                ))}
            </div>

            <div className={styles.contentSection}>
                {showChat ? <Chat /> : stepsToShow[currentStepIndex]?.component || stepsToShow[currentStepIndex]?.content}

                {showInitialForm && (
                    <div className={styles.formContainer}>
                        <Initial setShowInitial={setShowInitialForm} subscriptionId={subscription?.id} />
                    </div>
                )}
            </div>

            <div className={styles.fixedChatButton}>
                <Button type="primary" onClick={() => setShowChat(!showChat)}>
                    {showChat ? 'Cerrar Chat' : 'Mostrar Chat'}
                </Button>
            </div>
        </div>
    );
};

export default Subscription;
