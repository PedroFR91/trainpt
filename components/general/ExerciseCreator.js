import React, { useContext, useEffect } from 'react';
import { Modal, Form, Input, Button, notification } from 'antd';
import { db } from "../../firebase.config";
import { addDoc, updateDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import AuthContext from '../../context/AuthContext'
const ExerciseCreator = ({ visible, setVisible, currentExercise }) => {
    const [form] = Form.useForm();
    const { myUid } = useContext(AuthContext);
    console.log(myUid)
    useEffect(() => {
        if (currentExercise) {
            form.setFieldsValue(currentExercise);
        } else {
            form.resetFields();
        }
    }, [currentExercise, form, visible]);


    const handleFinish = async (values) => {
        try {
            if (currentExercise) {
                await updateDoc(doc(db, 'exercises', currentExercise.id), values);
                notification.success({
                    message: 'Ejercicio actualizado',
                    description: 'El ejercicio ha sido actualizado exitosamente',
                    placement: 'topRight',
                });
            } else {
                await addDoc(collection(db, 'exercises'), {
                    ...values,
                    trainerId: myUid,
                    timeStamp: serverTimestamp(),
                });
                notification.success({
                    message: 'Ejercicio creado',
                    description: 'El ejercicio ha sido creado exitosamente',
                    placement: 'topRight',
                });
            }
            setVisible(false);
        } catch (error) {
            console.error("Error al guardar el ejercicio: ", error);
            notification.error({
                message: 'Error',
                description: 'Hubo un error al guardar el ejercicio',
                placement: 'topRight',
            });
        }
    };

    return (
        <Modal
            title={currentExercise ? "Editar Ejercicio" : "Crear Ejercicio"}
            visible={visible}
            onCancel={() => setVisible(false)}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
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
