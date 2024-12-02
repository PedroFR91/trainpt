// components/client/SubscriptionSection.js

import React, { useContext, useEffect, useState } from "react";
import { query, collection, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import {
    Card,
    Button,
    Steps,
    Modal,
    Form,
    Upload,
    Input,
    message,
} from "antd";
import {
    UploadOutlined,
    CheckOutlined,
    FileTextOutlined,
    SettingOutlined,
    SmileOutlined,
} from "@ant-design/icons";
import styles from "../../styles/Subscription.module.css";

const { Step } = Steps;

const SubscriptionSection = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [dietComment, setDietComment] = useState("");
    const [dietFile, setDietFile] = useState(null);
    const [uploadingDiet, setUploadingDiet] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [assignedForms, setAssignedForms] = useState([]); // Cambiado a array vacío
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

    useEffect(() => {
        const fetchClientForms = async () => {
            if (!myData?.id) return;

            const formsRef = collection(db, "clients", myData.id, "forms");
            const formsSnapshot = await getDocs(formsRef);

            if (!formsSnapshot.empty) {
                const formsList = formsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAssignedForms(formsList);
            } else {
                console.log("No se encontraron formularios para el cliente:", myData.id);
            }
        };

        fetchClientForms();
    }, [myData?.id]);

    const getStepIndex = (status) => {
        const steps = ["pending", "form", "routine", "diet", "complete"];
        return steps.indexOf(status);
    };

    const steps = [
        {
            title: "Solicitud Pendiente",
            icon: <SettingOutlined />,
            description: myData?.role === "trainer"
                ? "Aceptar la solicitud del cliente y enviar el formulario inicial."
                : "Esperando que el entrenador acepte tu solicitud.",
            action: myData?.role === "trainer" && (
                <Button type="primary" onClick={() => updateSubscriptionStatus("form")}>
                    Aceptar y Enviar Formulario
                </Button>
            ),
        },
        {
            title: "Formulario Inicial",
            icon: <FileTextOutlined />,
            description: "Por favor, completa el formulario inicial enviado por tu entrenador.",
            action: assignedForms.length > 0 ? ( // Validación corregida
                <Button type="primary" onClick={() => setFormVisible(true)}>
                    Ver Formulario
                </Button>
            ) : (
                <p>No se ha asignado ningún formulario inicial todavía.</p>
            ),
        },
        {
            title: "Rutina Propuesta",
            icon: <CheckOutlined />,
            description: "El entrenador propone una rutina personalizada.",
            action: myData?.role === "trainer" ? (
                <Button type="primary" onClick={() => updateSubscriptionStatus("diet")}>
                    Asignar Rutina
                </Button>
            ) : (
                <p>Revisar la rutina asignada en tu perfil.</p>
            ),
        },
        {
            title: "Plan de Dieta",
            icon: <SmileOutlined />,
            description: "El entrenador asigna un plan de dieta personalizado.",
            action: myData?.role === "trainer" ? (
                <Form layout="vertical">
                    <Form.Item label="Subir Plan de Dieta">
                        <Upload beforeUpload={(file) => { setDietFile(file); return false; }}>
                            <Button icon={<UploadOutlined />}>Seleccionar Archivo</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item label="Notas Adicionales">
                        <Input.TextArea
                            rows={4}
                            placeholder="Escribe cualquier nota sobre la dieta aquí..."
                            value={dietComment}
                            onChange={(e) => setDietComment(e.target.value)}
                        />
                    </Form.Item>
                    <Button type="primary" onClick={handleUploadDiet} loading={uploadingDiet}>
                        Guardar Dieta
                    </Button>
                </Form>
            ) : (
                <p>Revisar el plan de dieta asignado en tu perfil.</p>
            ),
        },
        {
            title: "Estado de la Suscripción",
            icon: <SmileOutlined />,
            description: "Servicios contratados y próximos pasos.",
            content: (
                <ul>
                    <li>Precio: 50€ al mes</li>
                    <li>Servicios: Rutinas personalizadas, 3 revisiones al mes</li>
                    <li>Fecha de inicio: {new Date().toLocaleDateString()}</li>
                    <li>Próxima revisión: 15 de octubre</li>
                </ul>
            ),
        },
    ];

    if (loading || !subscription) {
        return <div>Cargando estado de la suscripción...</div>;
    }

    return (
        <div className={styles.subscriptionContainer}>
            <Steps current={currentStep} direction="vertical">
                {steps.map(({ title, icon, description, action, content }, index) => (
                    <Step
                        key={index}
                        title={title}
                        icon={icon}
                        description={
                            <div>
                                <p>{description}</p>
                                {action && <div style={{ marginTop: "1rem" }}>{action}</div>}
                                {content && <div style={{ marginTop: "1rem" }}>{content}</div>}
                            </div>
                        }
                    />
                ))}
            </Steps>

            {/* Modal para Formulario Inicial */}
            <Modal
                title="Formulario Inicial"
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                footer={null}
            >
                {assignedForms[0] ? (
                    <div>
                        <h3>{assignedForms[0].title || "Formulario Inicial"}</h3>
                        <p>{assignedForms[0].description || "Por favor, completa las preguntas a continuación."}</p>
                        {/* Renderizar las preguntas del formulario */}
                    </div>
                ) : (
                    <p>No se encontró el formulario.</p>
                )}
            </Modal>
        </div>
    );
};

export default SubscriptionSection;
