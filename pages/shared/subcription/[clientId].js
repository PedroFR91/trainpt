import React, { useContext, useEffect, useState } from "react";
import {
    query,
    collection,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    onSnapshot,
} from "firebase/firestore";
import { db } from "../../../firebase.config";
import { useRouter } from "next/router";
import AuthContext from "../../../context/AuthContext";
import Link from "next/link";
import { Timeline, Card, Button } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import Chat from "../../../components/chat/chat"; // Importamos el componente del chat
import styles from "../../../styles/Subscription.module.css";

const { Meta } = Card;

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trainer, setTrainer] = useState(null);
    const router = useRouter();
    const { clientId } = router.query;
    const { myData } = useContext(AuthContext);
    const [myForm, setMyForm] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [currentStep, setCurrentStep] = useState("previous");
    const startDate = new Date().toLocaleDateString();

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
            (error) => console.log(error)
        );
        return () => unsub();
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
            (error) => console.log(error)
        );
        return () => unsub();
    }, []);

    useEffect(() => {
        if (router.isReady && clientId) {
            const subsQuery = query(collection(db, "subscriptions"), where("clientId", "==", clientId));
            getDocs(subsQuery).then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    const docId = querySnapshot.docs[0].id;
                    setSubscription({ ...docData, id: docId });
                }
                setLoading(false);
            }).catch((error) => {
                console.error("Error obteniendo la suscripción:", error);
                setLoading(false);
            });
        }
    }, [router, clientId]);

    const stepsToShow = [
        {
            step: "previous",
            description: "Chat abierto entre cliente y entrenador.",
        },
        {
            step: "form",
            description: "Formulario inicial enviado por el entrenador.",
        },
        {
            step: "routine",
            description: "Rutina propuesta por el entrenador.",
        },
        {
            step: "complete",
            description: "Estado de la suscripción: servicios contratados, precios, fechas de revisiones, etc.",
        },
    ];

    const currentStepIndex = stepsToShow.findIndex((step) => step.step === currentStep) || 0;

    if (loading) {
        return <div>Cargando estado de la suscripción...</div>;
    }

    // Función para mostrar el contenido según el paso actual
    const renderContentForStep = () => {
        switch (currentStep) {
            case "previous":
                return (
                    <div className={styles.chatContainer}>
                        <Chat /> {/* Aquí integramos el componente del chat */}
                    </div>
                );
            case "form":
                return (
                    <div>
                        <h2>Formulario Inicial</h2>
                        <p>Por favor, completa el formulario enviado por tu entrenador.</p>
                        <Button type="primary">
                            <Link href={`/shared/forms/${myForm[0]?.id}`}>Ver Formulario</Link>
                        </Button>
                    </div>
                );
            case "routine":
                return (
                    <div>
                        <h2>Rutina Propuesta</h2>
                        <p>Revisa la rutina personalizada enviada por tu entrenador.</p>
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
                    </div>
                );
            case "complete":
                return (
                    <div>
                        <h2>Estado de la Suscripción</h2>
                        <p>Servicios contratados, precios, fechas de revisiones, etc.</p>
                        <ul>
                            <li>Precio: 50€ al mes</li>
                            <li>Servicios: Rutinas personalizadas, 3 revisiones al mes</li>
                            <li>Fecha de inicio: {startDate}</li>
                            <li>Próxima revisión: 15 de octubre</li>
                        </ul>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.subscriptionContainer}>
            <video className={styles.backgroundVideo} autoPlay loop muted>
                <source src="/subscription.mp4" type="video/mp4" />
            </video>

            <div className={styles.timelineSection}>
                <Timeline mode="left" style={{ padding: "2rem" }}>
                    {stepsToShow.map(({ step, description }, index) => (
                        <Timeline.Item
                            key={step}
                            color={index === currentStepIndex ? "green" : "gray"}
                            dot={index === currentStepIndex ? <SmileOutlined /> : null}
                            style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}
                        >
                            {description}
                        </Timeline.Item>
                    ))}
                </Timeline>
            </div>

            <div className={styles.contentSection}>
                {renderContentForStep()}
            </div>
        </div>
    );
};

export default Subscription;
