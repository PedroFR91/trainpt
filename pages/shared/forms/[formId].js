import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../../firebase.config';
import { serverTimestamp } from 'firebase/firestore';
import { Form, Input, Select, Button, Upload, message, Space, Spin } from 'antd';
import { AiOutlineUpload } from 'react-icons/ai';
import styles from './sharedform.module.css';
import TrainerHeader from '../../../components/trainer/trainerHeader';

const { TextArea } = Input;

const FormPage = () => {
  const router = useRouter();
  const { formId } = router.query;

  const [formStructure, setFormStructure] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const clientId = "ZxRxQ8YhZWXzPoVXaHgheM6R1Rf1"; // Establece el clientId directamente

  useEffect(() => {
    if (router.isReady) {
      const fetchSubscription = async () => {
        try {
          const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", clientId));
          const querySnapshot = await getDocs(subsQuery);
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            const docId = querySnapshot.docs[0].id;
            setSubscription({ ...docData, id: docId });
          } else {
            console.error("No se encontró la suscripción para el cliente:", clientId);
          }
        } catch (error) {
          console.error("Error al obtener la suscripción:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubscription();
    }
  }, [clientId, router.isReady]);

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

  const handleCreate = async () => {
    try {
      const formRef = await addDoc(collection(db, "forms"), {
        ...formStructure,
        type: "ClienteInicial",
        clientId: clientId,
        timeStamp: serverTimestamp(),
      });

      console.log("Formulario creado con éxito", formRef.id);

      if (subscription && subscription.id) {
        await updateDoc(doc(db, 'subscriptions', subscription.id), {
          status: 'revision',
        });
        console.log(`Estado de suscripción actualizado a 'revision'.`);
      }

      router.back();
    } catch (error) {
      console.error("Error al crear el formulario o actualizar la suscripción:", error);
      message.error("Error al crear el formulario o actualizar la suscripción.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: value,
    }));
  };

  const handleMeasuresChange = (event) => {
    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      measures: {
        ...prevFormStructure.measures,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const uploadPhoto = async (fieldName, file) => {
    if (file) {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        setFormStructure((prevFormStructure) => ({
          ...prevFormStructure,
          [fieldName]: downloadURL,
        }));
      } catch (error) {
        console.error(`Error al subir ${fieldName}:`, error);
        message.error(`Error al subir ${fieldName}.`);
      }
    }
  };

  if (loading || !formStructure) {
    return <Spin size="large" className={styles.loadingSpinner} />;
  }

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Form
        layout="vertical"
        className={styles.initial}
        onFinish={handleCreate}
      >
        <h3>Datos generales</h3>
        <Form.Item label="Nombre">
          <Input
            name='name'
            placeholder='Pedro'
            value={formStructure.name || ''}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item label="Sexo">
          <Select
            name='gender'
            value={formStructure.gender || ''}
            onChange={(value) => handleChange({ target: { name: 'gender', value } })}
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
          <Button type="primary" htmlType="submit">Enviar</Button>
        </Form.Item>
      </Form>
      <Button className={styles.closebutton} onClick={() => router.back()}>X</Button>
    </div>
  );
};

export default FormPage;
