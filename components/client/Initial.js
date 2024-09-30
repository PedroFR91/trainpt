import React, { useContext, useState } from "react";
import { Form, Input, Button, Select, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { initialForm } from "../../forms/initialForm";  // Asegúrate de que este archivo tiene la estructura correcta
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;

const Initial = ({ setShowInitial }) => {
  const { myUid } = useContext(AuthContext);

  // Inicializar la estructura del formulario, asegurándonos de que tiene todos los campos
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
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: ''
    }
  });

  const [additionalFields, setAdditionalFields] = useState([]);
  const [form] = Form.useForm();

  const handleCreate = async (values) => {
    try {
      // Subir las fotos y obtener sus URLs
      const frontUrl = values.front?.file ? await uploadPhoto(values.front.file.originFileObj) : null;
      const backUrl = values.back?.file ? await uploadPhoto(values.back.file.originFileObj) : null;
      const lateralUrl = values.lateral?.file ? await uploadPhoto(values.lateral.file.originFileObj) : null;

      // Crear un objeto limpio que excluya los campos con valor undefined
      const cleanValues = {
        ...formStructure,  // Asegurarse de incluir todos los campos
        front: frontUrl,
        back: backUrl,
        lateral: lateralUrl,
        additionalFields,
        type: "Inicial",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      };

      // Crear el formulario en Firestore
      const formRef = await addDoc(collection(db, "forms"), cleanValues);

      // Actualizar el documento del usuario con el ID del formulario creado
      const userDocRef = doc(db, "users", myUid);
      await updateDoc(userDocRef, {
        initialForm: formRef.id,
      });

      // Resetear los campos adicionales y cerrar el modal
      setAdditionalFields([]);
      setShowInitial(false);
    } catch (error) {
      console.error("Error al crear el formulario:", error);
    }
  };

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

  return (
    <Form form={form} onFinish={handleCreate} className={styles.initial}>
      <h3>Datos generales</h3>
      <Form.Item name="name" label="Nombre">
        <Input placeholder="Pedro" onChange={(e) => setFormStructure({ ...formStructure, name: e.target.value })} />
      </Form.Item>
      <Form.Item name="gender" label="Sexo">
        <Select onChange={(value) => setFormStructure({ ...formStructure, gender: value })}>
          <Option value="man">Hombre</Option>
          <Option value="woman">Mujer</Option>
        </Select>
      </Form.Item>
      <Form.Item name="weight" label="Peso">
        <Input onChange={(e) => setFormStructure({ ...formStructure, weight: e.target.value })} />
      </Form.Item>
      <Form.Item name="height" label="Altura">
        <Input onChange={(e) => setFormStructure({ ...formStructure, height: e.target.value })} />
      </Form.Item>

      <h3>Fotos</h3>
      <Form.Item name="front" label="Frente">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, front: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="back" label="Espalda">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, back: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="lateral" label="Lateral">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => {
            setFormStructure({ ...formStructure, lateral: url });
            onSuccess(url);
          });
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
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
          {initialForm.trainingDays.options.map((option) => (
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
        <Button type="primary" htmlType="submit">
          Guardar Formulario
        </Button>
      </Form.Item>
      <Button className={styles.closebutton} onClick={() => setShowInitial(false)}>
        X
      </Button>
    </Form>
  );
};

export default Initial;
