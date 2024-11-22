import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Space, Form, Input, notification, Transfer, Steps, Checkbox, Select, Spin } from 'antd';
import { db } from "../../firebase.config";
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, where } from "firebase/firestore";
import TrainingCreator from './TrainingCreator';
import AuthContext from '../../context/AuthContext';

const { Step } = Steps;

const RoutineCreator = ({ visible, setVisible, currentRoutine, setCurrentRoutine, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [trainings, setTrainings] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [showNewTrainingModal, setShowNewTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [dayTrainingMap, setDayTrainingMap] = useState({});
  const { myUid } = useContext(AuthContext);
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTrainings = onSnapshot(
      collection(db, `trainers/${myUid}/trainings`),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTrainings(list);
        setLoading(false);
      }
    );

    if (currentRoutine) {
      form.setFieldsValue(currentRoutine);
      setDayTrainingMap(
        Object.fromEntries(
          Object.entries(currentRoutine.days || {}).map(([day, { trainingId }]) => [day, trainingId])
        )
      );
    } else {
      form.resetFields();
      setSelectedTrainings([]);
      setDayTrainingMap({});
    }

    return () => unsubTrainings();
  }, [currentRoutine, form, myUid]);


  const nextStep = () => {
    form.validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((errorInfo) => {
        console.error('Error en el formulario:', errorInfo);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    const values = form.getFieldsValue();
    const routineData = {
      name: values.name.trim(),
      description: values.description.trim(),
      trainerId: myUid,
      days: Object.fromEntries(
        Object.entries(dayTrainingMap).map(([day, trainingId]) => [day, { trainingId }])
      ),
      timeStamp: serverTimestamp(),
    };

    try {
      if (currentRoutine) {
        await updateDoc(doc(db, `trainers/${myUid}/routines`, currentRoutine.id), routineData);
        notification.success({
          message: 'Rutina actualizada',
          description: 'La rutina ha sido actualizada exitosamente',
        });
      } else {
        await addDoc(collection(db, `trainers/${myUid}/routines`), routineData);
        notification.success({
          message: 'Rutina creada',
          description: 'La rutina ha sido creada exitosamente',
        });
      }
      form.resetFields();
      setSelectedTrainings([]);
      setDayTrainingMap({});
      setVisible(false);
      setCurrentStep(0);
    } catch (error) {
      console.error('Error al guardar la rutina: ', error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al guardar la rutina',
      });
    }
  };


  const handleSubmit = () => {
    form.validateFields()
      .then(() => {
        if (Object.keys(dayTrainingMap).length === 0) {
          notification.error({
            message: 'Error',
            description: 'Debes asignar al menos un día con un entrenamiento',
            placement: 'topRight',
          });
          return;
        }
        handleFinish();
      })
      .catch((errorInfo) => {
        console.error('Error en el formulario:', errorInfo);
      });
  };

  const handleDaySelection = (day, isSelected) => {
    setDayTrainingMap((prev) => {
      const newMap = { ...prev };
      if (isSelected) {
        newMap[day] = null; // Inicialmente sin entrenamiento asignado
      } else {
        delete newMap[day];
      }
      return newMap;
    });
  };

  const handleTrainingAssignment = (day, trainingId) => {
    setDayTrainingMap((prev) => ({
      ...prev,
      [day]: trainingId,
    }));
  };
  const handleEditTraining = (training) => {
    const copiedTraining = { ...training, name: `${training.name} (copia)` };
    delete copiedTraining.id;
    setEditingTraining(copiedTraining);
    setShowNewTrainingModal(true); // Solo abrir el modal de edición
  };



  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <>
      <Modal
        title={currentRoutine ? "Editar Rutina" : "Crear Rutina"}
        open={visible}
        onCancel={() => {
          form.resetFields();
          setCurrentStep(0);
          setSelectedTrainings([]);
          setDayTrainingMap({});
          setVisible(false);
          setCurrentRoutine(null);
        }}
        footer={null}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <Form form={form} layout="vertical">
          <div>
            <Steps current={currentStep}>
              <Step title="Detalles" />
              <Step title="Entrenamientos" />
              <Step title="Asignar Días" />
              <Step title="Revisión" />
            </Steps>
            <div className="steps-content" style={{ marginTop: '24px' }}>
              {/* Paso 1: Detalles */}
              <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
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
              </div>
              {/* Paso 2: Entrenamientos */}
              <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button type="primary" onClick={() => {
                    setEditingTraining(null);
                    setShowNewTrainingModal(true);
                  }}>
                    Crear Entrenamiento
                  </Button>
                  <Transfer
                    dataSource={trainings}
                    showSearch
                    titles={['Disponibles', 'Seleccionados']}
                    targetKeys={selectedTrainings}
                    onChange={setSelectedTrainings}
                    render={item => (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        <Button
                          type="link"
                          onClick={() => handleEditTraining(item)}
                          style={{ marginLeft: '8px' }}
                        >
                          Editar
                        </Button>
                      </div>
                    )}
                    rowKey={(item) => item.id}
                  />
                </Space>
              </div>


              {/* Paso 3: Asignar Días y Entrenamientos */}
              <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                {daysOfWeek.map((day) => (
                  <div key={day} style={{ marginBottom: '16px' }}>
                    <Checkbox
                      checked={day in dayTrainingMap}
                      onChange={(e) => handleDaySelection(day, e.target.checked)}
                    >
                      {day}
                    </Checkbox>
                    {day in dayTrainingMap && (
                      <div style={{ marginLeft: '24px', marginTop: '8px' }}>
                        <Select
                          style={{ width: '80%' }}
                          placeholder="Selecciona un entrenamiento"
                          value={dayTrainingMap[day]}
                          onChange={(value) => handleTrainingAssignment(day, value)}
                        >
                          {trainings.map((training) => (
                            <Select.Option key={training.id} value={training.id}>
                              {training.name}
                            </Select.Option>
                          ))}
                        </Select>
                        <Button
                          type="link"
                          onClick={() => {
                            setEditingTraining(null);
                            setShowNewTrainingModal(true);
                          }}
                        >
                          Crear nuevo entrenamiento
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Paso 4: Revisión */}
              <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                <div>
                  <h3>Resumen de la Rutina</h3>
                  <p><strong>Nombre:</strong> {form.getFieldValue('name')}</p>
                  <p><strong>Descripción:</strong> {form.getFieldValue('description')}</p>
                  <p><strong>Días y Entrenamientos:</strong></p>
                  <ul>
                    {Object.entries(dayTrainingMap).map(([day, trainingId]) => {
                      const training = trainings.find((t) => t.id === trainingId);
                      return (
                        <li key={day}>
                          <strong>{day}:</strong> {training ? training.name : 'Entrenamiento no asignado'}
                        </li>
                      );
                    })}
                  </ul>
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
                <Button type="primary" onClick={handleSubmit}>
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
        {showNewTrainingModal && (
          <TrainingCreator
            visible={showNewTrainingModal}
            setVisible={setShowNewTrainingModal}
            currentTraining={editingTraining}
          />
        )}
      </Modal>
    </>
  );
};

export default RoutineCreator;
