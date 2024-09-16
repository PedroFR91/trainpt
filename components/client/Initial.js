import React, { useContext, useState } from "react";
import { Form, Input, Button, Select, Upload } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { initialForm } from "../../forms/initialForm";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import styles from "../../styles/forms.module.css";

const { Option } = Select;

const Initial = ({ setShowInitial }) => {
  const { myUid } = useContext(AuthContext);
  const [formStructure, setFormStructure] = useState({
    ...initialForm,
    gender: "man",
  });
  const [additionalFields, setAdditionalFields] = useState([]);
  const [form] = Form.useForm();

  const addField = (type) => {
    const newField = {
      type: type,
      label: "",
      value: "",
      newOption: "",
      options: type === "select" ? [] : undefined,
    };
    setAdditionalFields([...additionalFields, newField]);
  };

  const handleLabelChange = (e, index) => {
    const updatedFields = [...additionalFields];
    updatedFields[index].label = e.target.value;
    setAdditionalFields(updatedFields);
  };

  const handleNewOptionChange = (e, index) => {
    const updatedFields = [...additionalFields];
    updatedFields[index].newOption = e.target.value;
    setAdditionalFields(updatedFields);
  };

  const addSelectOption = (index) => {
    const updatedFields = [...additionalFields];
    if (updatedFields[index].newOption.trim() !== "") {
      updatedFields[index].options.push(updatedFields[index].newOption);
      updatedFields[index].newOption = "";
    }
    setAdditionalFields(updatedFields);
  };

  const handleCreate = async (values) => {
    try {
      const formRef = await addDoc(collection(db, "forms"), {
        ...values,
        additionalFields,
        type: "Inicial",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      });

      const userDocRef = doc(db, "users", myUid);
      await updateDoc(userDocRef, {
        initialForm: formRef.id
      });

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
      <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Por favor ingrese su nombre' }]}>
        <Input placeholder="Pedro" />
      </Form.Item>
      <Form.Item name="gender" label="Sexo" rules={[{ required: true, message: 'Por favor seleccione su género' }]}>
        <Select>
          <Option value="man">Hombre</Option>
          <Option value="woman">Mujer</Option>
        </Select>
      </Form.Item>
      <Form.Item name="weight" label="Peso" rules={[{ required: true, message: 'Por favor ingrese su peso' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="height" label="Altura" rules={[{ required: true, message: 'Por favor ingrese su altura' }]}>
        <Input />
      </Form.Item>
      <h3>Fotos</h3>
      <Form.Item name="front" label="Frente" valuePropName="file">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => onSuccess(url));
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="back" label="Espalda" valuePropName="file">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => onSuccess(url));
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="lateral" label="Lateral" valuePropName="file">
        <Upload customRequest={({ file, onSuccess }) => {
          uploadPhoto(file).then(url => onSuccess(url));
        }} listType="picture">
          <Button icon={<UploadOutlined />}>Subir imagen</Button>
        </Upload>
      </Form.Item>
      <h3>Dieta</h3>
      <Form.Item name="intolerances" label="Intolerancias">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="preferredFoods" label="Preferencias de comida">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="trainingDays" label="Días de entrenamiento">
        <Select>
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
          <Input />
        </Form.Item>
      ))}
      <h3>Preguntas extra:</h3>
      <Button type="dashed" onClick={() => addField("text")}>Añadir Campo de Texto</Button>
      <Button type="dashed" onClick={() => addField("select")}>Añadir Campo de Selección</Button>
      {additionalFields.map((field, index) => (
        <div key={index}>
          <Input
            placeholder="Etiqueta"
            value={field.label}
            onChange={(e) => handleLabelChange(e, index)}
          />
          {field.type === "text" ? (
            <Input
              value={field.value}
              onChange={(e) => handleNewOptionChange(e, index)}
            />
          ) : (
            <>
              <Select onChange={(value) => handleLabelChange({ target: { value } }, index)}>
                {field.options.map((option, optionIndex) => (
                  <Option key={optionIndex} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              <div>
                <Input
                  placeholder="Nueva Opción"
                  value={field.newOption}
                  onChange={(e) => handleNewOptionChange(e, index)}
                />
                <Button type="dashed" onClick={() => addSelectOption(index)}>Añadir Opción</Button>
              </div>
            </>
          )}
        </div>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Guardar Formulario
        </Button>
      </Form.Item>
      <Button
        className={styles.closebutton}
        onClick={() => setShowInitial(false)}
      >
        X
      </Button>
    </Form>
  );
};

export default Initial;
