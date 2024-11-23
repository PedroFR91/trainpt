import React, { useState, useEffect, useContext } from 'react';
import { Button, message, Modal, Form, Input, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import RatesCard from './RatesCard';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  listenToSubcollection,
  addSubcollectionDocument,
  updateSubcollectionDocument,
} from '../../services/firebase';

const MyRates = () => {
  const [form] = Form.useForm(); // Referencia al formulario
  const { myUid } = useContext(AuthContext);
  const [rates, setRates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [quillContent, setQuillContent] = useState('');

  useEffect(() => {
    if (!myUid) return;

    const unsub = listenToSubcollection(
      'trainers',
      myUid,
      'rates',
      [],
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRates(list);
      },
      (error) => console.error('Error fetching rates: ', error)
    );
    return () => unsub();
  }, [myUid]);

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setQuillContent(rate.rateinfo || '');
    form.setFieldsValue(rate);
    setIsAdding(false);
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      if (isAdding) {
        await addSubcollectionDocument('trainers', myUid, 'rates', {
          ...values,
          rateinfo: quillContent,
          backgroundColor: values.backgroundColor || '#ffffff',
        });
        message.success('Tarifa añadida correctamente');
      } else {
        await updateSubcollectionDocument('trainers', myUid, 'rates', editingRate.id, {
          ...values,
          rateinfo: quillContent,
        });
        message.success('Tarifa actualizada correctamente');
      }
      setIsModalVisible(false);
      setEditingRate(null);
      setIsAdding(false);
      form.resetFields();
    } catch (error) {
      console.error('Error al guardar la tarifa: ', error);
      message.error('Error al guardar la tarifa');
    }
  };

  return (
    <div>
      <RatesCard rates={rates} onEdit={handleEdit} />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => {
          setIsAdding(true);
          setEditingRate(null);
          setQuillContent('');
          form.resetFields();
          setIsModalVisible(true);
        }}
      >
        Añadir Tarifa
      </Button>

      <Modal
        title={isAdding ? 'Añadir Tarifa' : 'Editar Tarifa'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRate(null);
          setQuillContent('');
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          initialValues={{
            ratename: '',
            rateprice: '',
            ratefrequency: '',
            backgroundColor: '#ffffff',
          }}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item
            label="Nombre de la tarifa"
            name="ratename"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre de la tarifa' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Precio"
            name="rateprice"
            rules={[{ required: true, message: 'Por favor, ingresa el precio' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Frecuencia"
            name="ratefrequency"
            rules={[{ required: true, message: 'Por favor, ingresa la frecuencia' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Información adicional">
            <ReactQuill
              value={quillContent}
              onChange={setQuillContent}
              theme="snow"
            />
          </Form.Item>
          <Form.Item
            label="Color de fondo"
            name="backgroundColor"
          >
            <Input type="color" />
          </Form.Item>
          <Divider />
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MyRates;
