import React, { useContext, useEffect, useState } from "react";
import {
    query,
    collection,
    where,
    getDocs,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db, storage } from "../../../firebase.config";
import { useRouter } from "next/router";
import AuthContext from "../../../context/AuthContext";
import { Card, Button, Modal, Select, message, Form, Upload, Input } from "antd";
import Chat from "../../../components/chat/chat";
import Initial from "../../../components/client/Initial";
import RoutineCreator from "../../../components/general/RoutineCreator";
import styles from "../../../styles/Subscription.module.css";
import Link from "next/link";
import { UploadOutlined } from "@ant-design/icons";
import RoutineDetails from "../../../components/general/RoutineDetails";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const { Meta } = Card;

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [showInitialForm, setShowInitialForm] = useState(false);
    const [showRoutineSelectorModal, setShowRoutineSelectorModal] = useState(false);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [routines, setRoutines] = useState([]);
    const [selectedRoutine, setSelectedRoutine] = useState(null);
    const [dietComment, setDietComment] = useState("");
    const [dietFile, setDietFile] = useState(null);
    const [uploadingDiet, setUploadingDiet] = useState(false);

    const router = useRouter();
    const { clientId } = router.query;
    const { myData } = useContext(AuthContext);
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

        const fetchRoutines = async () => {
            const routinesSnapshot = await getDocs(collection(db, "routines"));
            setRoutines(routinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchRoutines();
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

    // Función para subir la dieta
    const handleUploadDiet = async () => {
        if (!dietFile || !dietComment) {
            message.error("Por favor sube un archivo y agrega un comentario.");
            return;
        }

        setUploadingDiet(true);
        try {
            // Subir el archivo de la dieta a Firebase Storage
            const storageRef = ref(storage, `dietas/${subscription.id}/${dietFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, dietFile);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    setUploadingDiet(false);
                    message.error("Error al subir la dieta.");
                },
                async () => {
                    // Obtener la URL del archivo subido
                    const dietURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Guardar la URL y el comentario en la suscripción
                    const subscriptionRef = doc(db, "subscriptions", subscription.id);
                    await updateDoc(subscriptionRef, {
                        diet: {
                            comment: dietComment,
                            fileURL: dietURL,
                        },
                        status: "complete", // Cambiar el estado a "complete"
                    });

                    setSubscription({ ...subscription, status: "complete", diet: { comment: dietComment, fileURL: dietURL } });
                    message.success("Dieta guardada exitosamente.");
                }
            );
        } catch (error) {
            message.error("Error al guardar la dieta.");
        } finally {
            setUploadingDiet(false);
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
            description: myData?.role === "trainer"
                ? "Selecciona o crea una rutina para tu cliente."
                : "Revisa la rutina personalizada enviada por tu entrenador.",
            action: myData?.role === "trainer" ? (
                <>
                    <Button type="primary" onClick={() => setShowRoutineSelectorModal(true)}>
                        Seleccionar o Crear Rutina
                    </Button>
                    <Button
                        type="primary"
                        disabled={!selectedRoutine}
                        onClick={async () => {
                            if (selectedRoutine) {
                                try {
                                    const subscriptionRef = doc(db, "subscriptions", subscription.id);
                                    await updateDoc(subscriptionRef, {
                                        status: "dieta", // Cambia el estado a 'dieta' al asignar rutina
                                        assignedRoutine: selectedRoutine,
                                    });
                                    setSubscription({ ...subscription, status: "dieta", assignedRoutine: selectedRoutine });
                                    message.success("Rutina asignada exitosamente. Pasando al paso de Dieta.");
                                } catch (error) {
                                    message.error("Error al asignar la rutina.");
                                }
                            }
                        }}
                    >
                        Asignar Rutina
                    </Button>
                </>
            ) : (
                <Card
                    hoverable
                    style={{ width: 300 }}
                    cover={<img alt="Rutina" src="/routine.jpg" />}
                >
                    <Meta
                        title="Rutina Propuesta"
                        description={
                            subscription?.assignedRoutine ? (
                                <Link href={`/trainer/routines/${subscription.assignedRoutine}`}>
                                    Ver Rutina
                                </Link>
                            ) : (
                                "No se ha asignado una rutina aún."
                            )
                        }
                    />
                </Card>
            )
        },
        {
            step: "dieta",
            title: "Plan de Dieta",
            description: "Sube tu plan de dieta y escribe notas adicionales.",
            action: (
                <>
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
                    </Form>
                    <Button type="primary" onClick={handleUploadDiet} loading={uploadingDiet}>
                        Guardar Dieta
                    </Button>
                </>
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
                {showChat ? <Chat /> : (
                    <>
                        {stepsToShow[currentStepIndex]?.component || stepsToShow[currentStepIndex]?.content}
                        {selectedRoutine && (
                            <RoutineDetails assignedRoutineId={subscription.assignedRoutine} />
                        )}
                    </>
                )}

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

            {showRoutineSelectorModal && (
                <Modal
                    title="Seleccionar o Crear Rutina"
                    open={showRoutineSelectorModal}
                    onCancel={() => setShowRoutineSelectorModal(false)}
                    footer={null}
                >
                    <Select
                        placeholder="Seleccionar Rutina Existente"
                        style={{ width: '100%', marginBottom: '1rem' }}
                        onChange={(value) => setSelectedRoutine(value)}
                    >
                        {routines.map(routine => (
                            <Select.Option key={routine.id} value={routine.id}>
                                {routine.name}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button type="primary" onClick={() => setShowRoutineModal(true)}>
                        Crear Nueva Rutina
                    </Button>
                    {showRoutineModal && (
                        <RoutineCreator
                            visible={showRoutineModal}
                            setVisible={setShowRoutineModal}
                            onCreate={(newRoutine) => {
                                setRoutines([...routines, newRoutine]);
                                setSelectedRoutine(newRoutine.id);
                                message.success("Nueva rutina creada y seleccionada.");
                            }}
                        />
                    )}
                </Modal>
            )}
        </div>
    );
};

export default Subscription;
