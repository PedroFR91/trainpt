import React, { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, notification, Select, List, Image } from 'antd';
import { db } from "../../firebase.config";
import { addDoc, updateDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import AuthContext from '../../context/AuthContext';

const { Option } = Select;

const ExerciseCreator = ({ visible, setVisible, currentExercise, onClose }) => {
    const [form] = Form.useForm();
    const { myUid } = useContext(AuthContext);
    const [apiExercises, setApiExercises] = useState([]);
    const [loadingApi, setLoadingApi] = useState(false);
    const [selectedApiExercise, setSelectedApiExercise] = useState(null);

    // Cargar los datos del ejercicio si se está editando
    useEffect(() => {
        if (currentExercise) {
            form.setFieldsValue(currentExercise);
        } else {
            form.resetFields();
        }
    }, [currentExercise, form, visible]);

    // Obtener ejercicios desde la API
    const fetchExercisesFromApi = async () => {
        setLoadingApi(true);
        const url = 'https://exercisedb.p.rapidapi.com/exercises';
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'f8dfa38133msh95f05bb867d14c6p1800e1jsn2ea50d0b494a', // Tu API key
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
            }
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();
            setApiExercises(data);  // Guardamos los ejercicios de la API en el estado
        } catch (error) {
            console.error('Error fetching exercises from API:', error);
            notification.error({
                message: 'Error al cargar ejercicios',
                description: 'Hubo un error al cargar los ejercicios desde la API',
            });
        } finally {
            setLoadingApi(false);
        }
    };

    // Al seleccionar un ejercicio de la API, autocompletar el formulario
    const handleSelectApiExercise = (exercise) => {
        setSelectedApiExercise(exercise);
        form.setFieldsValue({
            name: exercise.name,
            material: exercise.equipment,
            comments: exercise.target,
        });
    };

    // Guardar el ejercicio en Firestore
    const handleFinish = async (values) => {
        try {
            const exerciseData = {
                ...values,
                trainerId: myUid,
                timeStamp: serverTimestamp(),
            };

            // Agregar el GIF si se seleccionó un ejercicio desde la API
            if (selectedApiExercise) {
                exerciseData.gifUrl = selectedApiExercise.gifUrl;
            }

            if (currentExercise) {
                await updateDoc(doc(db, 'exercises', currentExercise.id), exerciseData);
                notification.success({
                    message: 'Ejercicio actualizado',
                    description: 'El ejercicio ha sido actualizado exitosamente',
                });
            } else {
                await addDoc(collection(db, 'exercises'), exerciseData);
                notification.success({
                    message: 'Ejercicio creado',
                    description: 'El ejercicio ha sido creado exitosamente',
                });
            }

            setVisible(false);
        } catch (error) {
            console.error("Error al guardar el ejercicio: ", error);
            notification.error({
                message: 'Error',
                description: 'Hubo un error al guardar el ejercicio',
            });
        }
    };

    return (
        <Modal
            title={currentExercise ? "Editar Ejercicio" : "Crear Ejercicio"}
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={null}
            afterClose={() => setSelectedApiExercise(null)}  // Limpiar el ejercicio seleccionado después de cerrar el modal
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                {/* Selector para cargar ejercicios desde la API */}
                <Form.Item label="Cargar ejercicio desde la API">
                    <Button type="primary" onClick={fetchExercisesFromApi} loading={loadingApi}>
                        {loadingApi ? "Cargando ejercicios..." : "Cargar ejercicios de la API"}
                    </Button>
                    {apiExercises.length > 0 && (
                        <Select
                            showSearch
                            placeholder="Seleccionar ejercicio"
                            onChange={(value) => handleSelectApiExercise(apiExercises.find(e => e.id === value))}
                            style={{ width: '100%', marginTop: '10px' }}
                        >
                            {apiExercises.map(exercise => (
                                <Option key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>

                {/* Previsualización del ejercicio seleccionado desde la API */}
                {selectedApiExercise && (
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Previsualización del Ejercicio Seleccionado:</h4>
                        <Image src={selectedApiExercise.gifUrl} alt={selectedApiExercise.name} width={200} />
                    </div>
                )}

                {/* Formulario para crear o editar un ejercicio */}
                <Form.Item
                    name="name"
                    label="Nombre del Ejercicio"
                    rules={[{ required: true, message: 'Por favor ingresa el nombre del ejercicio' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="material"
                    label="Material necesario"
                    rules={[{ required: true, message: 'Por favor ingresa el material necesario' }]}
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item
                    name="comments"
                    label="Comentarios"
                    rules={[{ required: true, message: 'Por favor ingresa los comentarios' }]}
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        {currentExercise ? "Actualizar Ejercicio" : "Crear Ejercicio"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExerciseCreator;
