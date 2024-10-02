import React, { useState } from 'react';
import { Steps, Button, Form, Input, Select, Upload } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';

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

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formStructure, setFormStructure] = useState({
    name: '',
    gender: 'man',
    weight: '',
    height: '',
    front: null,
    back: null,
    lateral: null,
    intolerances: '',
    preferredFoods: '',
    trainingDays: '',
    reviewPeriodicity: '7',
    trainingComments: '',
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: '',
    },
    generalQuestions: [],
    dietQuestions: [],
  });

  const next = () => setCurrentStep(currentStep + 1);
  const prev = () => setCurrentStep(currentStep - 1);

  const addGeneralQuestion = () => {
    const newQuestion = { title: '', answer: '' };
    setFormStructure((prev) => ({
      ...prev,
      generalQuestions: [...prev.generalQuestions, newQuestion],
    }));
  };

  const addDietQuestion = () => {
    const newQuestion = { title: '', answer: '' };
    setFormStructure((prev) => ({
      ...prev,
      dietQuestions: [...prev.dietQuestions, newQuestion],
    }));
  };

  const handleQuestionChange = (index, value, block) => {
    const updatedQuestions = formStructure[block].map((question, i) =>
      i === index ? { ...question, title: value } : question
    );
    setFormStructure({ ...formStructure, [block]: updatedQuestions });
  };

  const stepsContent = [
    // Step 1: Datos Generales
    <div key="1">
      <h3>Datos generales</h3>
      <Form.Item name="name" label="Nombre">
        <Input
          placeholder="Pedro"
          onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item name="gender" label="Sexo">
        <Select
          onChange={(value) => setFormStructure({ ...formStructure, gender: value })}
        >
          <Option value="man">Hombre</Option>
          <Option value="woman">Mujer</Option>
        </Select>
      </Form.Item>
      <Form.Item name="weight" label="Peso">
        <Input
          onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })}
        />
      </Form.Item>
      <Form.Item name="height" label="Altura">
        <Input
          onChange={(e) => setFormStructure({ ...formStructure, height: e.target.value })}
        />
      </Form.Item>

      <h4>Preguntas adicionales en Datos Generales</h4>
      {formStructure.generalQuestions.map((question, index) => (
        <Form.Item key={index} label={`Pregunta ${index + 1}`}>
          <Input
            placeholder="Título de la pregunta"
            onChange={(e) => handleQuestionChange(index, e.target.value, 'generalQuestions')}
          />
        </Form.Item>
      ))}
      <Button icon={<PlusOutlined />} onClick={addGeneralQuestion}>
        Añadir pregunta
      </Button>
    </div>,

    // Step 2: Fotos
    <div key="2">
      <h3>Fotos</h3>
      <Form.Item name="front" label="Frente">
        <Upload
          customRequest={({ file, onSuccess }) => {
            // lógica de subida de imagen
            onSuccess("ok");
          }}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="back" label="Espalda">
        <Upload
          customRequest={({ file, onSuccess }) => {
            // lógica de subida de imagen
            onSuccess("ok");
          }}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="lateral" label="Lateral">
        <Upload
          customRequest={({ file, onSuccess }) => {
            // lógica de subida de imagen
            onSuccess("ok");
          }}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
    </div>,

    // Step 3: Dieta
    <div key="3">
      <h3>Dieta</h3>
      <Form.Item name="intolerances" label="Intolerancias">
        <Input.TextArea
          onChange={(e) => setFormStructure({ ...formStructure, intolerances: e.target.value })}
        />
      </Form.Item>
      <Form.Item name="preferredFoods" label="Preferencias de comida">
        <Input.TextArea
          onChange={(e) => setFormStructure({ ...formStructure, preferredFoods: e.target.value })}
        />
      </Form.Item>

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
        <Select
          onChange={(value) => setFormStructure({ ...formStructure, trainingDays: value })}
        >
          <Option value="1">1</Option>
          <Option value="2">2</Option>
          <Option value="3">3</Option>
          <Option value="4">4</Option>
          <Option value="5">5</Option>
          <Option value="6">6</Option>
          <Option value="7">7</Option>
        </Select>
      </Form.Item>
      <Form.Item name="reviewPeriodicity" label="Periodicidad de revisión">
        <Select
          onChange={(value) => setFormStructure({ ...formStructure, reviewPeriodicity: value })}
        >
          <Option value="7">Cada 7 días</Option>
          <Option value="14">Cada 2 semanas</Option>
          <Option value="30">Cada mes</Option>
        </Select>
      </Form.Item>
      <Form.Item name="trainingComments" label="Comentarios sobre el entrenamiento">
        <Input.TextArea
          onChange={(e) => setFormStructure({ ...formStructure, trainingComments: e.target.value })}
        />
      </Form.Item>
    </div>,

    // Step 5: Medidas
    <div key="5">
      <h3>Medidas</h3>
      {Object.keys(formStructure.measures).map((key) => (
        <Form.Item key={key} name={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
          <Input
            onChange={(e) =>
              setFormStructure({
                ...formStructure,
                measures: { ...formStructure.measures, [key]: e.target.value },
              })
            }
          />
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

export default MultiStepForm;
