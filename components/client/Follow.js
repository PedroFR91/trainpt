import React, { useContext, useState } from "react";
import { Form, Input, Button, Select, Upload, Steps } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { follow } from "../../forms/initialForm";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;

const steps = [
  {
    title: 'Datos Generales',
  },
  {
    title: 'Fotos',
  },
  {
    title: 'Dieta',
  },
  {
    title: 'Entrenamiento',
  },
  {
    title: 'Medidas',
  },
];

const Follow = ({ setShowFollow }) => {
  const { myUid } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0); // Controlar el paso actual del multi-step
  const [formStructure, setFormStructure] = useState({
    name: '',
    weight: '',
    front: null,
    back: null,
    lateral: null,
    intolerances: '',
    preferredFoods: '',
    trainingDays: '',
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: ''
    },
    dietQuestions: [],  // Preguntas adicionales en dieta
    trainingQuestions: [],  // Preguntas adicionales en entrenamiento
  });

  const [form] = Form.useForm();

  // Función para subir las fotos a Firebase Storage
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

  const handleCreate = async (values) => {
    try {
      // Subir fotos y obtener URLs
      const frontUrl = values.front?.file ? await uploadPhoto(values.front.file.originFileObj) : null;
      const backUrl = values.back?.file ? await uploadPhoto(values.back.file.originFileObj) : null;
      const lateralUrl = values.lateral?.file ? await uploadPhoto(values.lateral.file.originFileObj) : null;

      // Crear objeto limpio con los datos del formulario
      const cleanValues = {
        ...formStructure,  // Usar los campos actuales del formulario
        front: frontUrl,
        back: backUrl,
        lateral: lateralUrl,
        type: "Seguimiento", // Tipo de formulario de seguimiento
        trainerId: myUid,    // Asignar el id del entrenador
        timeStamp: serverTimestamp(),
      };

      // Guardar el formulario en Firestore
      await addDoc(collection(db, "forms"), cleanValues);

      // Reiniciar campos adicionales y cerrar modal
      setShowFollow(false);
    } catch (error) {
      console.error("Error al crear el formulario de seguimiento:", error);
    }
  };

  // Añadir nuevas preguntas a la dieta
  const addDietQuestion = () => {
    const newQuestion = { title: '', answer: '' };
    setFormStructure((prev) => ({
      ...prev,
      dietQuestions: [...prev.dietQuestions, newQuestion],
    }));
  };

  // Añadir nuevas preguntas al entrenamiento
  const addTrainingQuestion = () => {
    const newQuestion = { title: '', answer: '' };
    setFormStructure((prev) => ({
      ...prev,
      trainingQuestions: [...prev.trainingQuestions, newQuestion],
    }));
  };

  const handleQuestionChange = (index, value, block) => {
    const updatedQuestions = formStructure[block].map((question, i) =>
      i === index ? { ...question, title: value } : question
    );
    setFormStructure({ ...formStructure, [block]: updatedQuestions });
  };

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  // Contenido de cada paso
  const stepsContent = [
    // Step 1: Datos Generales
    <div key="1">
      <h3>Datos Generales</h3>
      <Form.Item name="name" label="Nombre">
        <Input placeholder="Nombre del cliente" onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })} />
      </Form.Item>
      <Form.Item name="weight" label="Peso">
        <Input onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })} />
      </Form.Item>
    </div>,

    // Step 2: Fotos
    <div key="2">
      <h3>Fotos</h3>
      <Form.Item name="front" label="Frente">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, front: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen frontal</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="back" label="Espalda">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, back: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen trasera</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="lateral" label="Lateral">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, lateral: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen lateral</Button>
        </Upload>
      </Form.Item>
    </div>,

    // Step 3: Dieta
    <div key="3">
      <h3>Dieta</h3>
      <Form.Item name="intolerances" label="Intolerancias">
        <Input.TextArea onChange={(e) => setFormStructure({ ...formStructure, intolerances: e.target.value })} />
      </Form.Item>
      <Form.Item name="preferredFoods" label="Preferencias de comida">
        <Input.TextArea onChange={(e) => setFormStructure({ ...formStructure, preferredFoods: e.target.value })} />
      </Form.Item>

      {/* Preguntas adicionales en la sección de dieta */}
      <h4>Preguntas adicionales en Dieta</h4>
      {formStructure.dietQuestions.map((question, index) => (
        <Form.Item key={index} label={`Pregunta ${index + 1}`}>
          <Input
            placeholder="Título de la pregunta"
            onChange={(e) => handleQuestionChange(index, e.target.value, 'dietQuestions')}
          />
        </Form.Item>
      ))}
      <Button icon={<PlusOutlined />} onClick={addDietQuestion}>
        Añadir pregunta
      </Button>
    </div>,

    // Step 4: Entrenamiento
    <div key="4">
      <h3>Entrenamiento</h3>
      <Form.Item name="trainingDays" label="Días de entrenamiento">
        <Select onChange={(value) => setFormStructure({ ...formStructure, trainingDays: value })}>
          {follow.trainingDays.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Preguntas adicionales en la sección de entrenamiento */}
      <h4>Preguntas adicionales en Entrenamiento</h4>
      {formStructure.trainingQuestions.map((question, index) => (
        <Form.Item key={index} label={`Pregunta ${index + 1}`}>
          <Input
            placeholder="Título de la pregunta"
            onChange={(e) => handleQuestionChange(index, e.target.value, 'trainingQuestions')}
          />
        </Form.Item>
      ))}
      <Button icon={<PlusOutlined />} onClick={addTrainingQuestion}>
        Añadir pregunta
      </Button>
    </div>,

    // Step 5: Medidas
    <div key="5">
      <h3>Medidas</h3>
      {Object.keys(formStructure.measures).map((key) => (
        <Form.Item key={key} name={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
          <Input onChange={(e) => setFormStructure({
            ...formStructure,
            measures: { ...formStructure.measures, [key]: e.target.value }
          })} />
        </Form.Item>
      ))}
    </div>,
  ];

  return (
    <div>
      <Steps current={currentStep}>
        {steps.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div className="steps-content">{stepsContent[currentStep]}</div>

      <div className="steps-action" style={{ marginTop: 24 }}>
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Siguiente
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => console.log('Formulario enviado:', formStructure)}
          >
            Finalizar
          </Button>
        )}
        {currentStep > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Anterior
          </Button>
        )}
      </div>
    </div>
  );
};

export default Follow;
