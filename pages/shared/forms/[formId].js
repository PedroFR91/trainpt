import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { Form, Input, Select, Button, Upload, Spin, Space } from 'antd';
import { db, storage } from '../../../firebase.config';
import TrainerHeader from '../../../components/trainer/trainerHeader';
import styles from './sharedform.module.css';
import withAuth from '../../../components/withAuth';
import { AiOutlineUpload } from 'react-icons/ai';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const { TextArea } = Input;

const FormPage = () => {
  const router = useRouter();
  const { formId, clientId } = router.query;

  const [formStructure, setFormStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        const formDoc = doc(db, 'forms', formId);
        const formSnapshot = await getDoc(formDoc);
        if (formSnapshot.exists()) {
          setFormStructure(formSnapshot.data());
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
  }, [formId]);

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

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Form layout="vertical" className={styles.initial} onFinish={handleUpdate}>
        <h3>Datos generales</h3>
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
          <Form.Item label="Pecho">
            <Input
              name='chest'
              value={formStructure.measures?.chest || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Hombros">
            <Input
              name='shoulders'
              value={formStructure.measures?.shoulders || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Biceps">
            <Input
              name='biceps'
              value={formStructure.measures?.biceps || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Cintura">
            <Input
              name='hips'
              value={formStructure.measures?.hips || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Abdomen">
            <Input
              name='abdomen'
              value={formStructure.measures?.abdomen || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Cuadriceps">
            <Input
              name='cuadriceps'
              value={formStructure.measures?.cuadriceps || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
          <Form.Item label="Gemelos">
            <Input
              name='gemelos'
              value={formStructure.measures?.gemelos || ''}
              onChange={handleMeasuresChange}
            />
          </Form.Item>
        </Space>

        <Form.Item>
          <Button type="primary" htmlType="submit">Guardar</Button>
        </Form.Item>
      </Form>
      <Button className={styles.closebutton} onClick={() => router.back()}>X</Button>
    </div>
  );
};

export default withAuth(FormPage);
