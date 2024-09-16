import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Table, notification, Form, Input, Select, Upload, message, Spin, Transfer, Steps } from 'antd';
import { db, storage } from "../../firebase.config";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot, getDocs, query, where, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaRegEdit, FaRegTrashAlt, FaCopy, FaEye } from 'react-icons/fa';
import TrainerHeader from '../../components/trainer/trainerHeader';
import TrainingCreator from './TrainingCreator';
import styles from './routinePage.module.css';

const { TextArea } = Input;
const { Step } = Steps;

const RoutinePage = () => {
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [viewRoutineModal, setViewRoutineModal] = useState(false);
  const [formStructure, setFormStructure] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [trainings, setTrainings] = useState([]);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [showNewTrainingModal, setShowNewTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);

  const clientId = "ZxRxQ8YhZWXzPoVXaHgheM6R1Rf1"; // Establece el clientId directamente

  useEffect(() => {
    const unsubRoutines = onSnapshot(collection(db, "routines"), (snapshot) => {
      setRoutines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const fetchSubscription = async () => {
      try {
        const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", clientId));
        const querySnapshot = await getDocs(subsQuery);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;
          setSubscription({ ...docData, id: docId });
        } else {
          console.error("No se encontró la suscripción para el cliente:", clientId);
        }
      } catch (error) {
        console.error("Error al obtener la suscripción:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    const unsubTrainings = onSnapshot(collection(db, "trainings"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTrainings(list);
    });

    return () => {
      unsubRoutines();
      unsubTrainings();
    };
  }, [clientId]);

  const handleCreate = async () => {
    try {
      const formRef = await addDoc(collection(db, "forms"), {
        ...formStructure,
        type: "ClienteInicial",
        clientId: clientId,
        timeStamp: serverTimestamp(),
      });

      console.log("Formulario creado con éxito", formRef.id);

      if (subscription && subscription.id) {
        await updateDoc(doc(db, 'subscriptions', subscription.id), {
          status: 'revision',
        });
        console.log(`Estado de suscripción actualizado a 'revision'.`);
      }

      notification.success({
        message: 'Formulario enviado',
        description: 'El formulario ha sido enviado exitosamente',
        placement: 'topRight',
      });
    } catch (error) {
      console.error("Error al crear el formulario o actualizar la suscripción:", error);
      message.error("Error al crear el formulario o actualizar la suscripción.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: value,
    }));
  };

  const handleMeasuresChange = (event) => {
    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      measures: {
        ...prevFormStructure.measures,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const uploadPhoto = async (fieldName, file) => {
    if (file) {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        setFormStructure((prevFormStructure) => ({
          ...prevFormStructure,
          [fieldName]: downloadURL,
        }));
      } catch (error) {
        console.error(`Error al subir ${fieldName}:`, error);
        message.error(`Error al subir ${fieldName}.`);
      }
    }
  };

  const handleViewRoutine = (routine) => {
    setCurrentRoutine(routine);
    setViewRoutineModal(true);
  };

  const handleDelete = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      notification.success({
        message: 'Elemento eliminado',
        description: 'El elemento ha sido eliminado exitosamente',
        placement: 'topRight',
      });
    } catch (error) {
      console.error("Error al eliminar el elemento: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al eliminar el elemento',
        placement: 'topRight',
      });
    }
  };

  const handleCopy = async (collectionName, item) => {
    const newItem = { ...item, name: `${item.name} (copia)` };
    delete newItem.id; // Remove the id property

    try {
      await addDoc(collection(db, collectionName), {
        ...newItem,
        timeStamp: serverTimestamp(),
      });
      notification.success({
        message: 'Elemento copiado',
        description: 'El elemento ha sido copiado exitosamente',
        placement: 'topRight',
      });
    } catch (error) {
      console.error("Error al copiar el elemento: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al copiar el elemento',
        placement: 'topRight',
      });
    }
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <FaEye onClick={() => handleViewRoutine(record)} />
          <FaRegEdit onClick={() => handleEdit("routines", record)} />
          <FaCopy onClick={() => handleCopy("routines", record)} />
          <FaRegTrashAlt onClick={() => handleDelete("routines", record.id)} />
        </Space>
      ),
    },
  ];

  const handleEdit = (collectionName, item) => {
    setCurrentRoutine(item);
    setShowRoutineModal(true);
  };

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
      setShowRoutineModal(false);
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

  if (loading) {
    return <Spin size="large" className={styles.loadingSpinner} />;
  }

  return (
    <>
      <TrainerHeader />
      <div className={styles.container}>
        <Button type="primary" onClick={() => setShowRoutineModal(true)}>Crear Rutina</Button>
        <h3>Mis Rutinas</h3>
        <Table columns={columns} dataSource={routines} rowKey="id" />

        {showRoutineModal && (
          <Modal
            title={currentRoutine ? "Editar Rutina" : "Crear Rutina"}
            visible={showRoutineModal}
            onCancel={() => setShowRoutineModal(false)}
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
        )}

        {viewRoutineModal && (
          <Modal
            title="Ver Rutina"
            visible={viewRoutineModal}
            onCancel={() => setViewRoutineModal(false)}
            footer={null}
          >
            <p><strong>Nombre:</strong> {currentRoutine.name}</p>
            <p><strong>Descripción:</strong> {currentRoutine.description}</p>
            <p><strong>Entrenamientos:</strong></p>
            <ul>
              {currentRoutine.trainings && currentRoutine.trainings.map((training) => (
                <li key={training.id}>
                  <strong>Nombre:</strong> {training.name}
                  <br />
                  <strong>Descripción:</strong> {training.description}
                  <br />
                  <strong>Ejercicios:</strong>
                  <ul>
                    {training.exercises && training.exercises.map((exercise) => (
                      <li key={exercise.id}>
                        <strong>Nombre:</strong> {exercise.name}
                        <br />
                        <strong>Material:</strong> {exercise.material}
                        <br />
                        <strong>Comentarios:</strong> {exercise.comments}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Modal>
        )}
      </div>

      {/* Formulario */}
      <div className={styles.container}>
        <h3>Enviar Formulario</h3>
        <Form
          layout="vertical"
          className={styles.initial}
          onFinish={handleCreate}
        >
          <h3>Datos generales</h3>
          <Form.Item label="Nombre">
            <Input
              name='name'
              placeholder='Pedro'
              value={formStructure?.name || ''}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item label="Sexo">
            <Select
              name='gender'
              value={formStructure?.gender || ''}
              onChange={(value) => handleChange({ target: { name: 'gender', value } })}
            >
              <Select.Option value='man'>Hombre</Select.Option>
              <Select.Option value='woman'>Mujer</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Peso">
            <Input
              name='weight'
              value={formStructure?.weight || ''}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item label="Altura">
            <Input
              name='height'
              value={formStructure?.height || ''}
              onChange={handleChange}
            />
          </Form.Item>

          <h3>Fotos</h3>
          <Form.Item label="Frente">
            <Upload
              customRequest={({ file, onSuccess }) => {
                uploadPhoto('front', file);
                onSuccess("ok");
              }}
              showUploadList={false}
            >
              <Button icon={<AiOutlineUpload />}>Subir Frente</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Espalda">
            <Upload
              customRequest={({ file, onSuccess }) => {
                uploadPhoto('back', file);
                onSuccess("ok");
              }}
              showUploadList={false}
            >
              <Button icon={<AiOutlineUpload />}>Subir Espalda</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Lateral">
            <Upload
              customRequest={({ file, onSuccess }) => {
                uploadPhoto('lateral', file);
                onSuccess("ok");
              }}
              showUploadList={false}
            >
              <Button icon={<AiOutlineUpload />}>Subir Lateral</Button>
            </Upload>
          </Form.Item>

          <h3>Dieta</h3>
          <Form.Item label="Intolerancias">
            <TextArea
              name='intolerances'
              value={formStructure?.intolerances || ''}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item label="Preferencias de comida">
            <TextArea
              name='preferredFoods'
              value={formStructure?.preferredFoods || ''}
              onChange={handleChange}
            />
          </Form.Item>

          <h3>Medidas</h3>
          <Space direction="vertical">
            <Form.Item label="Pecho">
              <Input
                name='chest'
                value={formStructure?.measures?.chest || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Hombros">
              <Input
                name='shoulders'
                value={formStructure?.measures?.shoulders || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Biceps">
              <Input
                name='biceps'
                value={formStructure?.measures?.biceps || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Cintura">
              <Input
                name='hips'
                value={formStructure?.measures?.hips || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Abdomen">
              <Input
                name='abdomen'
                value={formStructure?.measures?.abdomen || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Cuadriceps">
              <Input
                name='cuadriceps'
                value={formStructure?.measures?.cuadriceps || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
            <Form.Item label="Gemelos">
              <Input
                name='gemelos'
                value={formStructure?.measures?.gemelos || ''}
                onChange={handleMeasuresChange}
              />
            </Form.Item>
          </Space>

          <Form.Item>
            <Button type="primary" htmlType="submit">Enviar</Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default RoutinePage;
