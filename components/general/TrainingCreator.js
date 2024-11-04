import React, { useState, useEffect, useContext } from 'react';
import { Modal, Steps, Form, Input, Button, notification, Space, Transfer } from 'antd';
import { db } from "../../firebase.config";
import { addDoc, updateDoc, collection, doc, serverTimestamp, onSnapshot } from "firebase/firestore";
import ExerciseCreator from './ExerciseCreator';
import AuthContext from '../../context/AuthContext';

const { Step } = Steps;

const TrainingCreator = ({ visible, setVisible, currentTraining, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [exercises, setExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [series, setSeries] = useState({});
    const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);
    const { myUid } = useContext(AuthContext);

    useEffect(() => {
        const unsubExercises = onSnapshot(collection(db, "exercises"), (snapshot) => {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setExercises(list);
        });

        if (currentTraining) {
            form.setFieldsValue(currentTraining);
            setSelectedExercises(currentTraining.exercises ? currentTraining.exercises.map(ex => ex.id) : []);
            setSeries(currentTraining.series || {});
        } else {
            form.resetFields();
            setSelectedExercises([]);
            setSeries({});
        }

        return () => unsubExercises();
    }, [currentTraining, form, visible]);

    const nextStep = () => {
        if (currentStep === 0) {
            form.validateFields(['name', 'description']).then(() => {
                setCurrentStep(currentStep + 1);
            }).catch((errorInfo) => {
                console.error('Error en el formulario:', errorInfo);
            });
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = async () => {
        try {
            const values = form.getFieldsValue(['name', 'description']);
            const selectedExercisesData = selectedExercises.map(id => exercises.find(ex => ex.id === id));
            const trainingData = {
                name: values.name.trim(),
                description: values.description.trim(),
                exercises: selectedExercisesData,
                series: series,
                trainerId: myUid,
                timeStamp: serverTimestamp(),
            };

            if (currentTraining) {
                await updateDoc(doc(db, 'trainings', currentTraining.id), trainingData);
                notification.success({
                    message: 'Entrenamiento actualizado',
                    description: 'El entrenamiento ha sido actualizado exitosamente',
                    placement: 'topRight',
                });
            } else {
                await addDoc(collection(db, 'trainings'), trainingData);
                notification.success({
                    message: 'Entrenamiento creado',
                    description: 'El entrenamiento ha sido creado exitosamente',
                    placement: 'topRight',
                });
            }
            form.resetFields();
            setSelectedExercises([]);
            setSeries({});
            setVisible(false);
            setCurrentStep(0); // Reiniciar al primer paso
        } catch (error) {
            console.error("Error al guardar el entrenamiento: ", error);
            notification.error({
                message: 'Error',
                description: 'Hubo un error al guardar el entrenamiento',
                placement: 'topRight',
            });
        }
    };

    const handleSeriesChange = (exerciseId, serieIndex, field, value) => {
        setSeries(prevSeries => {
            const exerciseSeries = prevSeries[exerciseId] || [];
            const newExerciseSeries = exerciseSeries.map((serie, index) => {
                if (index === serieIndex) {
                    return { ...serie, [field]: value };
                }
                return serie;
            });
            return {
                ...prevSeries,
                [exerciseId]: newExerciseSeries,
            };
        });
    };

    const addSeries = (exerciseId) => {
        setSeries(prevSeries => {
            const exerciseSeries = prevSeries[exerciseId] || [];
            return {
                ...prevSeries,
                [exerciseId]: [...exerciseSeries, { comment: '' }],
            };
        });
    };

    return (
        <>
            <Modal
                title={currentTraining ? "Editar Entrenamiento" : "Crear Entrenamiento"}
                open={visible}
                onCancel={() => {
                    form.resetFields();
                    setSelectedExercises([]);
                    setSeries({});
                    setCurrentStep(0); // Reiniciar al primer paso
                    setVisible(false);
                }}
                footer={null}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
                <Form form={form} layout="vertical">
                    <div>
                        <Steps current={currentStep}>
                            <Step key="Detalles" title="Detalles" />
                            <Step key="Ejercicios" title="Ejercicios" />
                            <Step key="Series" title="Series" />
                            <Step key="Revisión" title="Revisión" />
                        </Steps>
                        <div className="steps-content" style={{ marginTop: '24px' }}>
                            {/* Paso 1: Detalles */}
                            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                                <Form.Item
                                    name="name"
                                    label="Nombre del Entrenamiento"
                                    rules={[{ required: true, message: 'Por favor ingresa el nombre del entrenamiento' }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="description"
                                    label="Descripción"
                                    rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
                                >
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                            </div>
                            {/* Paso 2: Ejercicios */}
                            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Button type="primary" onClick={() => setShowNewExerciseModal(true)}>
                                        Crear Ejercicio
                                    </Button>
                                    <Transfer
                                        dataSource={exercises}
                                        showSearch
                                        titles={['Disponibles', 'Seleccionados']}
                                        targetKeys={selectedExercises}
                                        onChange={setSelectedExercises}
                                        render={item => item.name}
                                        rowKey={item => item.id}
                                    />
                                </Space>
                            </div>
                            {/* Paso 3: Series */}
                            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {selectedExercises.length > 0 ? (
                                        selectedExercises.map((exerciseId) => {
                                            const exercise = exercises.find(ex => ex.id === exerciseId);
                                            const exerciseSeries = series[exerciseId] || [];
                                            return (
                                                <div key={exerciseId} style={{ marginBottom: '16px' }}>
                                                    <h4>{exercise ? exercise.name : 'Ejercicio no encontrado'}</h4>
                                                    <Button onClick={() => addSeries(exerciseId)}>
                                                        Añadir Serie
                                                    </Button>
                                                    {exerciseSeries.map((serie, serieIndex) => (
                                                        <div key={`${exerciseId}-${serieIndex}`} style={{ marginTop: '8px' }}>
                                                            <p>Serie {serieIndex + 1}</p>
                                                            <Input
                                                                placeholder="Comentarios"
                                                                value={serie.comment}
                                                                onChange={(e) => handleSeriesChange(exerciseId, serieIndex, 'comment', e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>No hay ejercicios seleccionados.</p>
                                    )}
                                </Space>
                            </div>
                            {/* Paso 4: Revisión */}
                            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                                <div>
                                    <h3>Resumen del Entrenamiento</h3>
                                    <p><strong>Nombre:</strong> {form.getFieldValue("name")}</p>
                                    <p><strong>Descripción:</strong> {form.getFieldValue("description")}</p>
                                    <p><strong>Ejercicios:</strong></p>
                                    <ul>
                                        {selectedExercises.map((exerciseId) => {
                                            const exercise = exercises.find(ex => ex.id === exerciseId);
                                            return <li key={exerciseId}>{exercise ? exercise.name : 'Ejercicio no encontrado'}</li>;
                                        })}
                                    </ul>
                                    <p><strong>Series:</strong></p>
                                    {Object.entries(series).map(([exerciseId, exerciseSeries]) => {
                                        const exercise = exercises.find(ex => ex.id === exerciseId);
                                        return (
                                            <div key={exerciseId}>
                                                <p><strong>Ejercicio:</strong> {exercise ? exercise.name : 'Ejercicio no encontrado'}</p>
                                                {exerciseSeries.map((serie, index) => (
                                                    <p key={index}>Serie {index + 1}: {serie.comment}</p>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="steps-action" style={{ marginTop: '24px' }}>
                            {currentStep < 3 && (
                                <Button type="primary" onClick={nextStep}>
                                    Siguiente
                                </Button>
                            )}
                            {currentStep === 3 && (
                                <Button type="primary" onClick={handleFinish}>
                                    Confirmar
                                </Button>
                            )}
                            {currentStep > 0 && (
                                <Button style={{ margin: "0 8px" }} onClick={prevStep}>
                                    Anterior
                                </Button>
                            )}
                        </div>
                    </div>
                </Form>
            </Modal>
            {showNewExerciseModal && (
                <ExerciseCreator visible={showNewExerciseModal} setVisible={setShowNewExerciseModal} />
            )}
        </>
    );
};

export default TrainingCreator;
