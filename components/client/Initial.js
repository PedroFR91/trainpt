// components/client/Initial.js

import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Select, Upload, Steps, Divider, Space, message } from "antd";
import { PlusOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;
const { Step } = Steps;

// Componente auxiliar para campos dinámicos
const DynamicField = ({ field, index, section, updateField, removeField }) => {
  const handleTypeChange = (value) => {
    updateField(section, index, 'type', value);
  };

  const handleLabelChange = (e) => {
    updateField(section, index, 'label', e.target.value);
  };

  const handleOptionChange = (optionIndex, e) => {
    const newOptions = [...field.options];
    newOptions[optionIndex] = e.target.value;
    updateField(section, index, 'options', newOptions);
  };

  const addOption = () => {
    const newOptions = field.options ? [...field.options, ''] : [''];
    updateField(section, index, 'options', newOptions);
  };

  const removeOption = (optionIndex) => {
    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    updateField(section, index, 'options', newOptions);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16, backgroundColor: '#ffffff' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Tipo de Campo">
          <Select value={field.type} onChange={handleTypeChange} style={{ width: 200 }}>
            <Option value="input">Input</Option>
            <Option value="textarea">Textarea</Option>
            <Option value="select">Select</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Nombre del Campo">
          <Input value={field.label} onChange={handleLabelChange} placeholder="Nombre del campo" />
        </Form.Item>
        {field.type === 'select' && (
          <Form.Item label="Opciones">
            {field.options && field.options.map((option, optIndex) => (
              <Space key={optIndex} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(optIndex, e)}
                  placeholder={`Opción ${optIndex + 1}`}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => removeOption(optIndex)}
                  danger
                />
              </Space>
            ))}
            <Button type="dashed" onClick={addOption} block icon={<PlusOutlined />}>
              Añadir Opción
            </Button>
          </Form.Item>
        )}
        <Button type="danger" icon={<DeleteOutlined />} onClick={() => removeField(index)}>
          Eliminar Campo
        </Button>
      </Space>
    </div>
  );
};

const Initial = ({ setShowInitial, subscriptionId }) => {
  const { myUid } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [tariffs, setTariffs] = useState([]);

  // Obtener tarifas del entrenador desde Firestore
  useEffect(() => {
    const fetchTariffs = async () => {
      const q = query(collection(db, "tariffs"), where("trainerId", "==", myUid));
      const querySnapshot = await getDocs(q);
      const tariffsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTariffs(tariffsList);
    };
    fetchTariffs();
  }, [myUid]);

  // Inicializar estructura del formulario
  const [formStructure, setFormStructure] = useState({
    selectedTariff: null,
    name: '',
    gender: 'man',
    weight: '',
    height: '',
    front: null,
    back: null,
    lateral: null,
    dietFields: [],
    generalFields: [],
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: ''
    },
  });

  const [form] = Form.useForm();

  // Función para subir fotos a Firebase Storage
  const uploadPhoto = async (file) => {
    if (!file) {
      console.error("No hay archivo seleccionado");
      return null;
    }

    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error al subir ${file.name}:`, error);
      return null;
    }
  };


  // Manejar la creación del formulario
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
        type: "Inicial",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      };

      // Guardar el formulario en Firestore
      await addDoc(collection(db, "forms"), cleanValues);

      // Actualizar la suscripción para avanzar al paso de la rutina
      const subscriptionRef = doc(db, "subscriptions", subscriptionId);
      await updateDoc(subscriptionRef, {
        status: "routine",
      });

      // Mostrar mensaje de éxito y cerrar modal
      message.success("Formulario inicial creado correctamente. Avanzando al siguiente paso.");
      setShowInitial(false);
    } catch (error) {
      console.error("Error al crear el formulario:", error);
      message.error("Error al crear el formulario");
    }
  };

  // Añadir nuevo campo dinámico
  const addField = (section, type = 'input') => {
    const newField = { type, label: '', options: type === 'select' ? [''] : [] };
    setFormStructure(prev => ({
      ...prev,
      [section]: [...prev[section], newField]
    }));
  };

  // Actualizar campo dinámico
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

  // Eliminar campo dinámico
  const removeField = (section, index) => {
    const updatedFields = formStructure[section].filter((_, idx) => idx !== index);
    setFormStructure(prev => ({
      ...prev,
      [section]: updatedFields
    }));
  };

  // Definir los pasos del formulario
  const steps = [
    {
      title: 'Seleccionar Tarifa',
      content: (
        <>
          <Form.Item
            name="selectedTariff"
            label="Selecciona una tarifa"
            rules={[{ required: true, message: 'Por favor selecciona una tarifa' }]}
          >
            <Select
              placeholder="Selecciona una tarifa"
              onChange={(value) => setFormStructure({ ...formStructure, selectedTariff: value })}
            >
              {tariffs.map(tariff => (
                <Option key={tariff.id} value={tariff.id}>
                  {tariff.name} - {tariff.periodicity}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Datos Generales',
      content: (
        <>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
          >
            <Input
              placeholder="Nombre del cliente"
              onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Sexo"
            rules={[{ required: true, message: 'Por favor selecciona el sexo' }]}
          >
            <Select
              onChange={(value) => setFormStructure({ ...formStructure, gender: value })}
            >
              <Option value="man">Hombre</Option>
              <Option value="woman">Mujer</Option>
              <Option value="other">Otro</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="weight"
            label="Peso"
            rules={[{ required: true, message: 'Por favor ingresa el peso' }]}
          >
            <Input
              placeholder="Peso en kg"
              onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            name="height"
            label="Altura"
            rules={[{ required: true, message: 'Por favor ingresa la altura' }]}
          >
            <Input
              placeholder="Altura en cm"
              onChange={(e) => setFormStructure({ ...formStructure, height: e.target.value })}
            />
          </Form.Item>

          <Divider>Preguntas adicionales en Datos Generales</Divider>
          {formStructure.generalFields.map((field, index) => (
            <DynamicField
              key={index}
              field={field}
              index={index}
              section="generalFields"
              updateField={updateField}
              removeField={() => removeField('generalFields', index)}
            />
          ))}
          <Button type="dashed" onClick={() => addField('generalFields')} block icon={<PlusOutlined />}>
            Añadir Campo
          </Button>
        </>
      ),
    },
    {
      title: 'Fotos',
      content: (
        <>
          <Form.Item
            name="front"
            label="Frente"
            rules={[{ required: true, message: 'Por favor sube una imagen frontal' }]}
          >
            <Upload
              fileList={formStructure.front ? [formStructure.front.file] : []}
              customRequest={({ file, onSuccess }) => {
                setFormStructure(prev => ({ ...prev, front: { file } }));
                onSuccess("ok");
              }}
              listType="picture"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Subir imagen frontal</Button>
            </Upload>
            {formStructure.front && formStructure.front.file && (
              <img src={URL.createObjectURL(formStructure.front.file)} alt="Frente" style={{ width: '100%', marginTop: 8 }} />
            )}
          </Form.Item>
          <Form.Item
            name="back"
            label="Espalda"
            rules={[{ required: true, message: 'Por favor sube una imagen trasera' }]}
          >
            <Upload
              fileList={formStructure.back ? [formStructure.back.file] : []}
              customRequest={({ file, onSuccess }) => {
                setFormStructure(prev => ({ ...prev, back: { file } }));
                onSuccess("ok");
              }}
              listType="picture"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Subir imagen trasera</Button>
            </Upload>
            {formStructure.back && formStructure.back.file && (
              <img src={URL.createObjectURL(formStructure.back.file)} alt="Espalda" style={{ width: '100%', marginTop: 8 }} />
            )}
          </Form.Item>
          <Form.Item
            name="lateral"
            label="Lateral"
            rules={[{ required: true, message: 'Por favor sube una imagen lateral' }]}
          >
            <Upload
              fileList={formStructure.lateral ? [formStructure.lateral.file] : []}
              customRequest={({ file, onSuccess }) => {
                setFormStructure(prev => ({ ...prev, lateral: { file } }));
                onSuccess("ok");
              }}
              listType="picture"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Subir imagen lateral</Button>
            </Upload>
            {formStructure.lateral && formStructure.lateral.file && (
              <img src={URL.createObjectURL(formStructure.lateral.file)} alt="Lateral" style={{ width: '100%', marginTop: 8 }} />
            )}
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Dieta',
      content: (
        <>
          <Form.Item
            name="intolerances"
            label="Intolerancias"
            rules={[{ required: true, message: 'Por favor ingresa las intolerancias' }]}
          >
            <Input.TextArea
              placeholder="Describe tus intolerancias alimentarias"
              onChange={(e) => setFormStructure({ ...formStructure, intolerances: e.target.value })}
            />
          </Form.Item>
          <Form.Item
            name="preferredFoods"
            label="Preferencias de comida"
            rules={[{ required: true, message: 'Por favor ingresa las preferencias de comida' }]}
          >
            <Input.TextArea
              placeholder="Describe tus preferencias alimentarias"
              onChange={(e) => setFormStructure({ ...formStructure, preferredFoods: e.target.value })}
            />
          </Form.Item>

          <Divider>Preguntas adicionales en Dieta</Divider>
          {formStructure.dietFields.map((field, index) => (
            <DynamicField
              key={index}
              field={field}
              index={index}
              section="dietFields"
              updateField={updateField}
              removeField={() => removeField('dietFields', index)}
            />
          ))}
          <Button type="dashed" onClick={() => addField('dietFields')} block icon={<PlusOutlined />}>
            Añadir Campo
          </Button>
        </>
      ),
    },
    {
      title: 'Medidas',
      content: (
        <>
          {Object.keys(formStructure.measures).map((key) => (
            <Form.Item
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              rules={[{ required: true, message: `Por favor ingresa tu medida de ${key}` }]}
            >
              <Input
                placeholder={`Ingresa tu medida de ${key}`}
                onChange={(e) => setFormStructure({
                  ...formStructure,
                  measures: { ...formStructure.measures, [key]: e.target.value }
                })}
              />
            </Form.Item>
          ))}
        </>
      ),
    },
  ];

  const next = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prev = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <Form form={form} className={styles.initial} layout="vertical">
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
          <Button type="primary" onClick={handleCreate}>
            Finalizar
          </Button>
        )}
        <Button style={{ marginLeft: 8 }} onClick={() => setShowInitial(false)}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
};

export default Initial;
