import React, { useContext, useEffect, useState } from "react";
import { query, collection, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import { Card, Button, Steps, Modal, Form, DatePicker, message } from "antd";
import { UploadOutlined, CheckOutlined, SettingOutlined } from "@ant-design/icons";
import styles from "../../styles/Subscription.module.css";

const { Step } = Steps;

const SubscriptionSection = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [formVisible, setFormVisible] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const { myData } = useContext(AuthContext);

    useEffect(() => {
        if (myData?.id) {
            const fetchSubscription = async () => {
                const subsQuery = query(
                    collection(db, "subscriptions"),
                    where("clientId", "==", myData.id)
                );
                const querySnapshot = await getDocs(subsQuery);
                if (!querySnapshot.empty) {
                    const docId = querySnapshot.docs[0].id;
                    const docData = querySnapshot.docs[0].data();
                    setSubscription({ ...docData, id: docId });
                    setCurrentStep(getStepIndex(docData.status));
                }
                setLoading(false);
            };

            fetchSubscription();
        }
    }, [myData?.id]);

    const getStepIndex = (status) => {
        const steps = ["pending", "form", "routine", "diet", "active"];
        return steps.indexOf(status);
    };

    const updateSubscriptionStatus = async (status) => {
        if (!subscription) return;
        try {
            const subscriptionRef = doc(db, "subscriptions", subscription.id);
            await updateDoc(subscriptionRef, { status });
            setCurrentStep(getStepIndex(status));
            message.success(`Estado actualizado a ${status}`);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            message.error("Error al actualizar el estado");
        }
    };

    const handleStartDateSelection = async (date) => {
        if (!subscription) return;
        try {
            const subscriptionRef = doc(db, "subscriptions", subscription.id);
            await updateDoc(subscriptionRef, { startDate: date, status: "active" });
            message.success(`Tu suscripción comenzará el ${date.format("YYYY-MM-DD")}`);
            setCurrentStep(getStepIndex("active"));
        } catch (error) {
            console.error("Error al guardar la fecha de inicio:", error);
            message.error("Error al guardar la fecha de inicio");
        }
    };

    const steps = [
        {
            title: "Solicitud Pendiente",
            description: myData?.role === "trainer"
                ? "Aceptar la solicitud del cliente."
                : "Esperando que el entrenador acepte tu solicitud.",
            action: myData?.role === "trainer" && (
                <Button type="primary" onClick={() => updateSubscriptionStatus("form")}>
                    Aceptar Solicitud
                </Button>
            ),
        },
        {
            title: "Formulario Inicial",
            description: myData?.role === "trainer"
                ? "Verifica si el cliente ha completado el formulario."
                : "Completa el formulario inicial enviado por tu entrenador.",
            action: myData?.role === "client" && (
                <Button type="primary" onClick={() => setFormVisible(true)}>
                    Completar Formulario
                </Button>
            ),
        },
        {
            title: "Rutina Propuesta",
            description: myData?.role === "trainer"
                ? "Asigna una rutina personalizada."
                : "Revisa la rutina asignada en tu perfil.",
            action: myData?.role === "trainer" && (
                <Button type="primary" onClick={() => updateSubscriptionStatus("diet")}>
                    Asignar Rutina
                </Button>
            ),
        },
        {
            title: "Plan de Dieta",
            description: myData?.role === "trainer"
                ? "Sube el plan de dieta para el cliente."
                : "Revisa el plan de dieta asignado.",
            action: myData?.role === "trainer" && (
                <Button type="primary" onClick={() => updateSubscriptionStatus("active")}>
                    Guardar Dieta
                </Button>
            ),
        },
        {
            title: "Estado Activo",
            description: "Selecciona la fecha de inicio y revisa el resumen de tu suscripción.",
            action: myData?.role === "client" && (
                <div>
                    <DatePicker onChange={(date) => setStartDate(date)} />
                    <Button
                        type="primary"
                        style={{ marginTop: "1rem" }}
                        onClick={() => handleStartDateSelection(startDate)}
                    >
                        Confirmar Fecha de Inicio
                    </Button>
                </div>
            ),
        },
    ];

    if (loading || !subscription) {
        return <div>Cargando estado de la suscripción...</div>;
    }

    return (
        <div className={styles.subscriptionContainer}>
            <Steps current={currentStep} direction="vertical">
                {steps.map(({ title, description, action }, index) => (
                    <Step
                        key={index}
                        title={title}
                        description={
                            <div>
                                <p>{description}</p>
                                {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
                            </div>
                        }
                    />
                ))}
            </Steps>

            {/* Modal para el Formulario Inicial */}
            <Modal
                title="Formulario Inicial"
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                footer={null}
            >
                <p>Contenido del formulario inicial aquí...</p>
            </Modal>
        </div>
    );
};

export default SubscriptionSection;
