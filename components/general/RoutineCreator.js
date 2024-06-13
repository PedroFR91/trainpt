import React, { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Button, notification, Space, Transfer } from 'antd';
import { db } from "../../firebase.config";
import { addDoc, updateDoc, collection, doc, serverTimestamp, onSnapshot } from "firebase/firestore";
import TrainingCreator from './TrainingCreator';

const { Step } = Steps;

const RoutineCreator = ({ visible, setVisible, currentRoutine }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [trainings, setTrainings] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [showNewTrainingModal, setShowNewTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);

  useEffect(() => {
    const unsubTrainings = onSnapshot(collection(db, "trainings"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrainings(list);
    });

    if (currentRoutine) {
      form.setFieldsValue(currentRoutine);
      setSelectedTrainings(currentRoutine.trainings.map(tr => tr.id));
    } else {
      form.resetFields();
      setSelectedTrainings([]);
    }

    return () => unsubTrainings();
  }, [currentRoutine, form]);

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async (values) => {
    const routineData = {
      ...values,
      trainings: selectedTrainings.map(id => ({ id })),
      timeStamp: serverTimestamp(),
    };

    try {
      if (currentRoutine) {
        await updateDoc(doc(db, 'routines', currentRoutine.id), routineData);
        notification.success({
          message: 'Rutina actualizada',
          description: 'La rutina ha sido actualizada exitosamente',
          placement: 'topRight',
        });
      } else {
        await addDoc(collection(db, 'routines'), routineData);
        notification.success({
          message: 'Rutina creada',
          description: 'La rutina ha sido creada exitosamente',
          placement: 'topRight',
        });
      }
      form.resetFields();
      setSelectedTrainings([]);
      setVisible(false);
    } catch (error) {
      console.error("Error al guardar la rutina: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al guardar la rutina',
        placement: 'topRight',
      });
    }
  };

  const handleEditTraining = (training) => {
    setEditingTraining(training);
    setShowNewTrainingModal(true);
  };

  const handleCopyTraining = (training) => {
    const newTraining = { ...training, id: undefined, name: `${training.name} (copiado)` };
    addDoc(collection(db, 'trainings'), newTraining).then(() => {
      notification.success({
        message: 'Entrenamiento copiado',
        description: 'El entrenamiento ha sido copiado exitosamente',
        placement: 'topRight',
      });
    }).catch((error) => {
      console.error("Error al copiar el entrenamiento: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al copiar el entrenamiento',
        placement: 'topRight',
      });
    });
  };

  const renderTransferItem = item => (
    <div>
      <span>{item.name}</span>
      <div style={{ float: 'right' }}>
        <Button size="small" onClick={() => console.log('Ver', item)}>Ver</Button>
        <Button size="small" onClick={() => handleEditTraining(item)}>Editar</Button>
        <Button size="small" onClick={() => handleCopyTraining(item)}>Copiar</Button>
      </div>
    </div>
  );

  const steps = [
    {
      title: 'Detalles',
      content: (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Nombre de la Rutina"
            rules={[{ required: true, message: 'Por favor ingresa el nombre de la rutina' }]}
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
      title: 'Entrenamientos',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" onClick={() => setShowNewTrainingModal(true)}>
            Crear Entrenamiento
          </Button>
          <Transfer
            dataSource={trainings}
            showSearch
            titles={['Disponibles', 'Seleccionados']}
            targetKeys={selectedTrainings}
            onChange={setSelectedTrainings}
            render={renderTransferItem}
            rowKey={item => item.id}
          />
        </Space>
      ),
    },
    {
      title: 'Revisión',
      content: (
        <div>
          <h3>Resumen de la Rutina</h3>
          <p>Nombre: {form.getFieldValue("name")}</p>
          <p>Descripción: {form.getFieldValue("description")}</p>
          <p>Entrenamientos:</p>
          <ul>
            {selectedTrainings.map((trainingId) => {
              const training = trainings.find(t => t.id === trainingId);
              return <li key={trainingId}>{training ? training.name : 'Entrenamiento no encontrado'}</li>;
            })}
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={currentRoutine ? "Editar Rutina" : "Crear Rutina"}
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
      {showNewTrainingModal && (
        <TrainingCreator
          visible={showNewTrainingModal}
          setVisible={setShowNewTrainingModal}
          currentTraining={editingTraining}
        />
      )}
    </>
  );
};

export default RoutineCreator;
