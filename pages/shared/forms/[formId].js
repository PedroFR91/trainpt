// pages/shared/forms/[formId].js

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { Form, Input, Select, Button, Upload, Spin, Space, Card, Typography } from 'antd';
import { db, storage } from '../../../firebase.config';
import TrainerHeader from '../../../components/trainer/trainerHeader';
import styles from '../../../styles/sharedform.module.css';
import withAuth from '../../../components/withAuth';
import { AiOutlineUpload } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../../context/AuthContext';

const { TextArea } = Input;
const { Title } = Typography;

const FormPage = () => {
  const { myUid } = useContext(AuthContext);
  const router = useRouter();
  const { formId, clientId } = router.query;

  const [formStructure, setFormStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        const formDoc = doc(db, 'forms', formId);
        const formSnapshot = await getDoc(formDoc);
        if (formSnapshot.exists()) {
          setFormStructure(formSnapshot.data());
          // Verificar si el usuario es el cliente (tiene el mismo id que el clientId)
          setIsClient(clientId === myUid);
        } else {
          console.log('Formulario no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener el formulario:', error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchFormStructure();
    }
  }, [formId, clientId, myUid]);

  const handleUpdate = async () => {
    try {
      const formRef = doc(db, "forms", formId);
      await updateDoc(formRef, { ...formStructure });
      console.log("Formulario actualizado");
      router.back();
    } catch (error) {
      console.error("Error al actualizar el formulario:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormStructure((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMeasuresChange = (e) => {
    const { name, value } = e.target;
    setFormStructure((prev) => ({
      ...prev,
      measures: {
        ...prev.measures,
        [name]: value,
      },
    }));
  };

  const uploadPhoto = async (fieldName, file) => {
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    try {
      await uploadTask;
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

      setFormStructure((prev) => ({
        ...prev,
        [fieldName]: downloadURL,
      }));
    } catch (error) {
      console.error(`Error al subir ${fieldName}:`, error);
    }
  };

  if (loading || !formStructure) {
    return <Spin size="large" className={styles.loadingSpinner} />;
  }

  const isInitial = formStructure.type === 'Inicial';

  return (
    <div className={styles.container}>
      <div className={styles.content}>

        <Card className={styles.formCard}>
          <Form layout="vertical" className={styles.form} onFinish={isClient ? handleUpdate : null}>
            <Title level={3}>
              {isClient
                ? isInitial
                  ? 'Formulario Inicial (Editable)'
                  : 'Formulario de Seguimiento (Editable)'
                : isInitial
                  ? 'Formulario Inicial (Vista de Solo Lectura)'
                  : 'Formulario de Seguimiento (Vista de Solo Lectura)'}
            </Title>

            {/* Sección de Datos Generales */}
            <Card type="inner" title="Datos Generales" className={styles.sectionCard}>
              <Form.Item label="Nombre">
                <Input
                  name="name"
                  value={formStructure.name || ''}
                  onChange={handleChange}
                  readOnly={!isClient}
                />
              </Form.Item>
              <Form.Item label="Sexo">
                <Select
                  name="gender"
                  value={formStructure.gender || ''}
                  onChange={(value) => setFormStructure({ ...formStructure, gender: value })}
                  disabled={!isClient}
                >
                  <Select.Option value="man">Hombre</Select.Option>
                  <Select.Option value="woman">Mujer</Select.Option>
                </Select>
              </Form.Item>
              {isInitial && (
                <>
                  <Form.Item label="Peso">
                    <Input
                      name="weight"
                      value={formStructure.weight || ''}
                      onChange={handleChange}
                      readOnly={!isClient}
                    />
                  </Form.Item>
                  <Form.Item label="Altura">
                    <Input
                      name="height"
                      value={formStructure.height || ''}
                      onChange={handleChange}
                      readOnly={!isClient}
                    />
                  </Form.Item>
                </>
              )}
              {!isInitial && (
                <Form.Item label="Peso actual">
                  <Input
                    name="currentWeight"
                    value={formStructure.currentWeight || ''}
                    onChange={handleChange}
                    readOnly={!isClient}
                  />
                </Form.Item>
              )}
            </Card>

            {/* Sección de Fotos */}
            <Card type="inner" title="Fotos" className={styles.sectionCard}>
              <Form.Item label="Frente">
                {isClient ? (
                  <Upload
                    customRequest={({ file, onSuccess }) => {
                      uploadPhoto('front', file);
                      onSuccess("ok");
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<AiOutlineUpload />}>Subir Frente</Button>
                  </Upload>
                ) : null}
                {formStructure.front && (
                  <img src={formStructure.front} alt="Frente" className={styles.image} />
                )}
              </Form.Item>

              <Form.Item label="Espalda">
                {isClient ? (
                  <Upload
                    customRequest={({ file, onSuccess }) => {
                      uploadPhoto('back', file);
                      onSuccess("ok");
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<AiOutlineUpload />}>Subir Espalda</Button>
                  </Upload>
                ) : null}
                {formStructure.back && (
                  <img src={formStructure.back} alt="Espalda" className={styles.image} />
                )}
              </Form.Item>

              <Form.Item label="Lateral">
                {isClient ? (
                  <Upload
                    customRequest={({ file, onSuccess }) => {
                      uploadPhoto('lateral', file);
                      onSuccess("ok");
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<AiOutlineUpload />}>Subir Lateral</Button>
                  </Upload>
                ) : null}
                {formStructure.lateral && (
                  <img src={formStructure.lateral} alt="Lateral" className={styles.image} />
                )}
              </Form.Item>
            </Card>

            {/* Sección de Dieta */}
            <Card type="inner" title="Dieta" className={styles.sectionCard}>
              <Form.Item label="Intolerancias">
                <TextArea
                  name="intolerances"
                  value={formStructure.intolerances || ''}
                  onChange={handleChange}
                  readOnly={!isClient}
                />
              </Form.Item>
              <Form.Item label="Preferencias de comida">
                <TextArea
                  name="preferredFoods"
                  value={formStructure.preferredFoods || ''}
                  onChange={handleChange}
                  readOnly={!isClient}
                />
              </Form.Item>
            </Card>

            {/* Sección de Medidas */}
            <Card type="inner" title="Medidas" className={styles.sectionCard}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.keys(formStructure.measures || {}).map((key) => (
                  <Form.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                    <Input
                      name={key}
                      value={formStructure.measures[key] || ''}
                      onChange={handleMeasuresChange}
                      readOnly={!isClient}
                    />
                  </Form.Item>
                ))}
              </Space>
            </Card>

            {/* Botón de Guardar para el Cliente */}
            {isClient && (
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Guardar
                </Button>
              </Form.Item>
            )}
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(FormPage);
