import React, { useContext, useState } from "react";
import { Form, Input, Button, Select, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { follow } from "../../forms/initialForm";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;

const Follow = ({ setShowFollow }) => {
  const { myUid } = useContext(AuthContext);

  // Inicializar estructura del formulario de seguimiento
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
    additionalFields: [] // Campos adicionales que el entrenador pueda añadir
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
      const formRef = await addDoc(collection(db, "forms"), cleanValues);

      // Reiniciar campos adicionales y cerrar modal
      setFormStructure({ ...formStructure, additionalFields: [] });
      setShowFollow(false);
    } catch (error) {
      console.error("Error al crear el formulario de seguimiento:", error);
    }
  };

  return (
    <Form form={form} onFinish={handleCreate} className={styles.initial} layout="vertical">
      <h3>Datos generales</h3>
      <Form.Item name="name" label="Nombre">
        <Input placeholder="Nombre del cliente" onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })} />
      </Form.Item>
      <Form.Item name="weight" label="Peso">
        <Input onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })} />
      </Form.Item>

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

      <h3>Dieta</h3>
      <Form.Item name="intolerances" label="Intolerancias">
        <Input.TextArea onChange={(e) => setFormStructure({ ...formStructure, intolerances: e.target.value })} />
      </Form.Item>
      <Form.Item name="preferredFoods" label="Preferencias de comida">
        <Input.TextArea onChange={(e) => setFormStructure({ ...formStructure, preferredFoods: e.target.value })} />
      </Form.Item>
      <Form.Item name="trainingDays" label="Días de entrenamiento">
        <Select onChange={(value) => setFormStructure({ ...formStructure, trainingDays: value })}>
          {follow.trainingDays.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <h3>Medidas</h3>
      {Object.keys(formStructure.measures).map((key) => (
        <Form.Item key={key} name={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
          <Input onChange={(e) => setFormStructure({
            ...formStructure,
            measures: { ...formStructure.measures, [key]: e.target.value }
          })} />
        </Form.Item>
      ))}

      <Form.Item>
        <Button type="primary" htmlType="submit">Guardar Formulario</Button>
      </Form.Item>
      <Button className={styles.closebutton} onClick={() => setShowFollow(false)}>X</Button>
    </Form>
  );
};

export default Follow;
