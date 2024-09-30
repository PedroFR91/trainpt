import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { Form, Input, Select, Button, Upload, Spin, Space } from 'antd';
import { db, storage } from '../../../firebase.config';
import TrainerHeader from '../../../components/trainer/trainerHeader';
import styles from './sharedform.module.css';
import withAuth from '../../../components/withAuth';
import { AiOutlineUpload } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../../context/AuthContext';

const { TextArea } = Input;

const FormPage = () => {
  const { myUid } = useContext(AuthContext);  // Obtener el id del usuario actual
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

  // Si es cliente, puede editar el formulario
  if (isClient) {
    return (
      <div className={styles.container}>
        <TrainerHeader />
        <Form layout="vertical" className={styles.initial} onFinish={handleUpdate}>
          <h3>{isInitial ? 'Formulario Inicial' : 'Formulario de Seguimiento'}</h3>
          <Form.Item label="Nombre">
            <Input
              name='name'
              value={formStructure.name || ''}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item label="Sexo">
            <Select
              name='gender'
              value={formStructure.gender || ''}
              onChange={(value) => setFormStructure({ ...formStructure, gender: value })}
            >
              <Select.Option value='man'>Hombre</Select.Option>
              <Select.Option value='woman'>Mujer</Select.Option>
            </Select>
          </Form.Item>

          {/* Campos para formularios iniciales */}
          {isInitial && (
            <>
              <Form.Item label="Peso">
                <Input
                  name='weight'
                  value={formStructure.weight || ''}
                  onChange={handleChange}
                />
              </Form.Item>
              <Form.Item label="Altura">
                <Input
                  name='height'
                  value={formStructure.height || ''}
                  onChange={handleChange}
                />
              </Form.Item>
            </>
          )}

          {/* Campos para formularios de seguimiento */}
          {!isInitial && (
            <>
              <Form.Item label="Peso actual">
                <Input
                  name='currentWeight'
                  value={formStructure.currentWeight || ''}
                  onChange={handleChange}
                />
              </Form.Item>
            </>
          )}

          {/* Fotos */}
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
            {formStructure.front && (
              <img src={formStructure.front} alt="Frente" style={{ width: '100%' }} />
            )}
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
            {formStructure.back && (
              <img src={formStructure.back} alt="Espalda" style={{ width: '100%' }} />
            )}
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
            {formStructure.lateral && (
              <img src={formStructure.lateral} alt="Lateral" style={{ width: '100%' }} />
            )}
          </Form.Item>

          <h3>Dieta</h3>
          <Form.Item label="Intolerancias">
            <TextArea
              name='intolerances'
              value={formStructure.intolerances || ''}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item label="Preferencias de comida">
            <TextArea
              name='preferredFoods'
              value={formStructure.preferredFoods || ''}
              onChange={handleChange}
            />
          </Form.Item>

          <Form.Item label="Días de entrenamiento">
            <Input
              name='trainingDays'
              value={formStructure.trainingDays || ''}
              onChange={handleChange}
            />
          </Form.Item>

          <h3>Medidas</h3>
          <Space direction="vertical">
            {Object.keys(formStructure.measures || {}).map((key) => (
              <Form.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                <Input
                  name={key}
                  value={formStructure.measures[key] || ''}
                  onChange={handleMeasuresChange}
                />
              </Form.Item>
            ))}
          </Space>

          <Form.Item>
            <Button type="primary" htmlType="submit">Guardar</Button>
          </Form.Item>
        </Form>
        <Button className={styles.closebutton} onClick={() => router.back()}>X</Button>
      </div>
    );
  }

  // Si es entrenador, solo vista de lectura
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Form layout="vertical" className={styles.initial}>
        <h3>{isInitial ? 'Vista de Solo Lectura (Formulario Inicial)' : 'Vista de Solo Lectura (Formulario de Seguimiento)'}</h3>
        <Form.Item label="Nombre">
          <Input name='name' value={formStructure.name || ''} readOnly />
        </Form.Item>
        <Form.Item label="Sexo">
          <Select value={formStructure.gender || ''} disabled>
            <Select.Option value='man'>Hombre</Select.Option>
            <Select.Option value='woman'>Mujer</Select.Option>
          </Select>
        </Form.Item>

        {/* Mostrar imágenes si existen */}
        {formStructure.front && (
          <Form.Item label="Frente">
            <img src={formStructure.front} alt="Frente" style={{ width: '100%' }} />
          </Form.Item>
        )}
        {formStructure.back && (
          <Form.Item label="Espalda">
            <img src={formStructure.back} alt="Espalda" style={{ width: '100%' }} />
          </Form.Item>
        )}
        {formStructure.lateral && (
          <Form.Item label="Lateral">
            <img src={formStructure.lateral} alt="Lateral" style={{ width: '100%' }} />
          </Form.Item>
        )}

        <h3>Dieta</h3>
        <Form.Item label="Intolerancias">
          <TextArea name='intolerances' value={formStructure.intolerances || ''} readOnly />
        </Form.Item>
        <Form.Item label="Preferencias de comida">
          <TextArea name='preferredFoods' value={formStructure.preferredFoods || ''} readOnly />
        </Form.Item>

        <h3>Medidas</h3>
        <Space direction="vertical">
          {Object.keys(formStructure.measures || {}).map((key) => (
            <Form.Item key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
              <Input name={key} value={formStructure.measures[key] || ''} readOnly />
            </Form.Item>
          ))}
        </Space>

        <Button onClick={() => router.back()}>Volver</Button>
      </Form>
    </div>
  );
};

export default withAuth(FormPage);
