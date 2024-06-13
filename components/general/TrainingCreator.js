import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Button, notification, Space, Transfer } from 'antd';
import { db } from "../../firebase.config";
import { addDoc, updateDoc, collection, doc, serverTimestamp, onSnapshot } from "firebase/firestore";
import ExerciseCreator from './ExerciseCreator';
const { Step } = Steps;

const TrainingCreator = ({ visible, setVisible, currentTraining }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();
    const [exercises, setExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [series, setSeries] = useState([]);
    const [showNewExerciseModal, setShowNewExerciseModal] = useState(false);

    useEffect(() => {
        const unsubExercises = onSnapshot(collection(db, "exercises"), (snapshot) => {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setExercises(list);
        });

        if (currentTraining) {
            form.setFieldsValue(currentTraining);
            setSelectedExercises(currentTraining.exercises ? currentTraining.exercises.map(ex => ex.id) : []);
            setSeries(currentTraining.series || []);
        } else {
            form.resetFields();
            setSelectedExercises([]);
            setSeries([]);
        }

        return () => unsubExercises();
    }, [currentTraining, form]);

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = async (values) => {
        const selectedExercisesData = selectedExercises.map(id => exercises.find(ex => ex.id === id));
        const trainingData = {
            ...values,
            exercises: selectedExercisesData,
            series: series,
            timeStamp: serverTimestamp(),
        };

        console.log('Datos del entrenamiento a guardar:', JSON.stringify(trainingData, null, 2)); // Log para depuración

        try {
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
            setSeries([]);
            setVisible(false);
        } catch (error) {
            console.error("Error al guardar el entrenamiento: ", error);
            notification.error({
                message: 'Error',
                description: 'Hubo un error al guardar el entrenamiento',
                placement: 'topRight',
            });
        }
    };

    const handleSeriesChange = (index, field, value) => {
        const newSeries = [...series];
        newSeries[index][field] = value;
        setSeries(newSeries);
    };

    const addSeries = (exerciseId) => {
        const newSeries = [...series, { exerciseId, comment: '' }];
        setSeries(newSeries);
    };

    const steps = [
        {
            title: 'Detalles',
            content: (
                <Form form={form} layout="vertical" onFinish={handleFinish}>
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
                </Form>
            ),
        },
        {
            title: 'Ejercicios',
            content: (
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
            ),
        },
        {
            title: 'Series',
            content: (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {selectedExercises.length > 0 ? (
                        selectedExercises.map((exerciseId, index) => {
                            const exercise = exercises.find(ex => ex.id === exerciseId);
                            return (
                                <div key={exerciseId} style={{ marginBottom: '16px' }}>
                                    <h4>{exercise ? exercise.name : 'Ejercicio no encontrado'}</h4>
                                    <Button onClick={() => addSeries(exerciseId)}>
                                        Añadir Serie
                                    </Button>
                                    {series.filter(serie => serie.exerciseId === exerciseId).map((serie, serieIndex) => (
                                        <div key={serieIndex} style={{ marginTop: '8px' }}>
                                            <p>Serie {serieIndex + 1}</p>
                                            <Input
                                                placeholder="Comentarios"
                                                value={serie.comment}
                                                onChange={(e) => handleSeriesChange(serieIndex, 'comment', e.target.value)}
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
            ),
        },
        {
            title: 'Revisión',
            content: (
                <div>
                    <h3>Resumen del Entrenamiento</h3>
                    <p>Nombre: {form.getFieldValue("name")}</p>
                    <p>Descripción: {form.getFieldValue("description")}</p>
                    <p>Ejercicios:</p>
                    <ul>
                        {selectedExercises.map((exerciseId) => {
                            const exercise = exercises.find(ex => ex.id === exerciseId);
                            return <li key={exerciseId}>{exercise ? exercise.name : 'Ejercicio no encontrado'}</li>;
                        })}
                    </ul>
                    <p>Series:</p>
                    {series.map((serie, index) => {
                        const exercise = exercises.find(ex => ex.id === serie.exerciseId);
                        return (
                            <div key={index}>
                                <p>Ejercicio: {exercise ? exercise.name : 'Ejercicio no encontrado'}</p>
                                <p>Serie {index + 1}: {serie.comment}</p>
                            </div>
                        );
                    })}
                </div>
            ),
        },
    ];

    return (
        <>
            <Modal
                title={currentTraining ? "Editar Entrenamiento" : "Crear Entrenamiento"}
                visible={visible}
                onCancel={() => setVisible(false)}
                footer={null}
                style={{ top: '50%', transform: 'translateY(-50%)' }} // Centrar verticalmente
            >
                <div>
                    <Steps current={currentStep}>
                        {steps.map((item) => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <div className="steps-content">{steps[currentStep].content}</div>
                    <div className="steps-action">
                        {currentStep < steps.length - 1 && (
                            <Button type="primary" onClick={nextStep}>
                                Siguiente
                            </Button>
                        )}
                        {currentStep === steps.length - 1 && (
                            <Button type="primary" onClick={form.submit}>
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
            </Modal>
            {showNewExerciseModal && (
                <ExerciseCreator visible={showNewExerciseModal} setVisible={setShowNewExerciseModal} />
            )}
        </>
    );
};

export default TrainingCreator;
