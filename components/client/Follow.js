// components/client/Follow.js

import React, { useContext, useState } from "react";
import { Form, Input, Button, Select, Upload, Steps, Modal } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;
const { Step } = Steps;

const Follow = ({ setShowFollow }) => {
  const { myUid } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0);

  // Estructura inicial del formulario
  const [formStructure, setFormStructure] = useState({
    name: '',
    weight: '',
    front: null,
    back: null,
    lateral: null,
    dietFields: [],
    trainingFields: [],
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: ''
    },
    trainingFeedback: '',
  });

  const [form] = Form.useForm();

  // Función para subir fotos a Firebase Storage
  const uploadPhoto = async (file) => {
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error al subir ${file.name}:`, error);
    }
  };

  const handleCreate = async () => {
    try {
      // Subir fotos y obtener URLs
      const frontUrl = formStructure.front?.file ? await uploadPhoto(formStructure.front.file.originFileObj) : null;
      const backUrl = formStructure.back?.file ? await uploadPhoto(formStructure.back.file.originFileObj) : null;
      const lateralUrl = formStructure.lateral?.file ? await uploadPhoto(formStructure.lateral.file.originFileObj) : null;

      // Crear objeto limpio con los datos del formulario
      const cleanValues = {
        ...formStructure,
        front: frontUrl,
        back: backUrl,
        lateral: lateralUrl,
        type: "Seguimiento",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      };

      // Guardar el formulario en Firestore
      await addDoc(collection(db, "forms"), cleanValues);

      // Cerrar el modal
      setShowFollow(false);
    } catch (error) {
      console.error("Error al crear el formulario de seguimiento:", error);
    }
  };

  // Función para agregar nuevos campos
  const addField = (section) => {
    const newField = { type: 'input', label: '', options: [] };
    setFormStructure(prev => ({
      ...prev,
      [section]: [...prev[section], newField]
    }));
  };

  // Función para actualizar los campos
  const updateField = (section, index, key, value) => {
    const updatedFields = formStructure[section].map((field, idx) => {
      if (idx === index) {
        return { ...field, [key]: value };
      }
      return field;
    });
    setFormStructure(prev => ({
      ...prev,
      [section]: updatedFields
    }));
  };

  // Contenido de los pasos
  const steps = [
    {
      title: 'Datos Generales',
      content: (
        <>
          <Form.Item name="name" label="Nombre">
            <Input onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })} />
          </Form.Item>
          <Form.Item name="weight" label="Peso">
            <Input onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })} />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Fotos',
      content: (
        <>
          <Form.Item name="front" label="Frente">
            <Upload customRequest={({ file, onSuccess }) => {
              setFormStructure(prev => ({ ...prev, front: { file } }));
              onSuccess("ok");
            }} listType="picture">
              <Button icon={<UploadOutlined />}>Subir imagen frontal</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="back" label="Espalda">
            <Upload customRequest={({ file, onSuccess }) => {
              setFormStructure(prev => ({ ...prev, back: { file } }));
              onSuccess("ok");
            }} listType="picture">
              <Button icon={<UploadOutlined />}>Subir imagen trasera</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="lateral" label="Lateral">
            <Upload customRequest={({ file, onSuccess }) => {
              setFormStructure(prev => ({ ...prev, lateral: { file } }));
              onSuccess("ok");
            }} listType="picture">
              <Button icon={<UploadOutlined />}>Subir imagen lateral</Button>
            </Upload>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Dieta',
      content: (
        <>
          {formStructure.dietFields.map((field, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Input
                placeholder="Nombre del campo"
                value={field.label}
                onChange={(e) => updateField('dietFields', index, 'label', e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Select
                value={field.type}
                onChange={(value) => updateField('dietFields', index, 'type', value)}
                style={{ width: 120, marginBottom: 8 }}
              >
                <Option value="input">Input</Option>
                <Option value="textarea">Textarea</Option>
                <Option value="select">Select</Option>
              </Select>
              {field.type === 'select' && (
                <div style={{ marginBottom: 8 }}>
                  {field.options.map((option, idx) => (
                    <div key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                      <Input
                        placeholder={`Opción ${idx + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...field.options];
                          newOptions[idx] = e.target.value;
                          updateField('dietFields', index, 'options', newOptions);
                        }}
                        style={{ marginRight: 8 }}
                      />
                      <Button icon={<DeleteOutlined />} onClick={() => {
                        const newOptions = field.options.filter((_, i) => i !== idx);
                        updateField('dietFields', index, 'options', newOptions);
                      }} />
                    </div>
                  ))}
                  <Button icon={<PlusOutlined />} onClick={() => {
                    const newOptions = [...field.options, ''];
                    updateField('dietFields', index, 'options', newOptions);
                  }}>Añadir Opción</Button>
                </div>
              )}
              <Button icon={<DeleteOutlined />} onClick={() => {
                const updatedFields = formStructure.dietFields.filter((_, i) => i !== index);
                setFormStructure(prev => ({ ...prev, dietFields: updatedFields }));
              }}>Eliminar Campo</Button>
            </div>
          ))}
          <Button icon={<PlusOutlined />} onClick={() => addField('dietFields')}>Añadir Campo</Button>
        </>
      ),
    },
    {
      title: 'Entrenamiento',
      content: (
        <>
          <Form.Item name="trainingFeedback" label="¿Cómo te ha ido el entrenamiento?">
            <Input.TextArea onChange={(e) => setFormStructure({ ...formStructure, trainingFeedback: e.target.value })} />
          </Form.Item>
          {formStructure.trainingFields.map((field, index) => (
            <div key={index} style={{ marginBottom: 16 }}>
              <Input
                placeholder="Nombre del campo"
                value={field.label}
                onChange={(e) => updateField('trainingFields', index, 'label', e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <Select
                value={field.type}
                onChange={(value) => updateField('trainingFields', index, 'type', value)}
                style={{ width: 120, marginBottom: 8 }}
              >
                <Option value="input">Input</Option>
                <Option value="textarea">Textarea</Option>
                <Option value="select">Select</Option>
              </Select>
              {field.type === 'select' && (
                <div style={{ marginBottom: 8 }}>
                  {field.options.map((option, idx) => (
                    <div key={idx} style={{ display: 'flex', marginBottom: 4 }}>
                      <Input
                        placeholder={`Opción ${idx + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...field.options];
                          newOptions[idx] = e.target.value;
                          updateField('trainingFields', index, 'options', newOptions);
                        }}
                        style={{ marginRight: 8 }}
                      />
                      <Button icon={<DeleteOutlined />} onClick={() => {
                        const newOptions = field.options.filter((_, i) => i !== idx);
                        updateField('trainingFields', index, 'options', newOptions);
                      }} />
                    </div>
                  ))}
                  <Button icon={<PlusOutlined />} onClick={() => {
                    const newOptions = [...field.options, ''];
                    updateField('trainingFields', index, 'options', newOptions);
                  }}>Añadir Opción</Button>
                </div>
              )}
              <Button icon={<DeleteOutlined />} onClick={() => {
                const updatedFields = formStructure.trainingFields.filter((_, i) => i !== index);
                setFormStructure(prev => ({ ...prev, trainingFields: updatedFields }));
              }}>Eliminar Campo</Button>
            </div>
          ))}
          <Button icon={<PlusOutlined />} onClick={() => addField('trainingFields')}>Añadir Campo</Button>
        </>
      ),
    },
    {
      title: 'Medidas',
      content: (
        <>
          {Object.keys(formStructure.measures).map((key) => (
            <Form.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <Input onChange={(e) => setFormStructure({
                ...formStructure,
                measures: { ...formStructure.measures, [key]: e.target.value }
              })} />
            </Form.Item>
          ))}
        </>
      ),
    },
  ];

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => prev - 1);

  return (
    <Form form={form} onFinish={handleCreate} className={styles.initial} layout="vertical">
      <Steps current={currentStep}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content" style={{ marginTop: 24 }}>
        {steps[currentStep].content}
      </div>
      <div className="steps-action" style={{ marginTop: 24 }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={() => prev()}>
            Anterior
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Siguiente
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" htmlType="submit">
            Finalizar
          </Button>
        )}
        <Button style={{ marginLeft: 8 }} onClick={() => setShowFollow(false)}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
};

export default Follow;
