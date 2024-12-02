import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Modal,
  Form,
  Input,
  Divider,
  Skeleton,
  message,
} from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { listenToCollection, updateDocument, addDocument, deleteDocument } from '../../services/firebase';
import RichTextEditor from './RichTextEditor';

const { Option } = Select;

const MyRates = () => {
  const [selectedPeriodicity, setSelectedPeriodicity] = useState('monthly'); // Estado para periodicidad seleccionada
  const [rates, setRates] = useState([]); // Estado para las tarifas
  const [loading, setLoading] = useState(true); // Skeleton inicial
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false); // Modal para agregar tarifa
  const [editingRate, setEditingRate] = useState(null); // Tarifa que se está editando
  const [form] = Form.useForm();
  const [addForm] = Form.useForm(); // Formulario para agregar tarifas
  const [featuresContent, setFeaturesContent] = useState(''); // Estado para RichTextEditor
  const [newFeaturesContent, setNewFeaturesContent] = useState(''); // Estado para nuevas características

  useEffect(() => {
    const unsubscribe = listenToCollection(
      'rates', // Nombre de la colección en Firebase
      [],
      (snapshot) => {
        const ratesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRates(ratesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al escuchar tarifas:', error);
        message.error('Error al cargar tarifas desde Firebase');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleEdit = (rate) => {
    setEditingRate(rate);
    form.setFieldsValue(rate);
    setFeaturesContent(rate.features || ''); // Establece el contenido de características
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    try {
      await updateDocument('rates', editingRate.id, {
        ...values,
        features: featuresContent,
      });

      message.success('Tarifa actualizada correctamente');
      setIsModalVisible(false);
      setEditingRate(null);
      form.resetFields();
      setFeaturesContent('');
    } catch (error) {
      console.error('Error al actualizar tarifa:', error);
      message.error('Error al guardar la tarifa');
    }
  };

  const handleAdd = async (values) => {
    try {
      await addDocument('rates', {
        ...values,
        features: newFeaturesContent,
      });

      message.success('Tarifa agregada correctamente');
      setIsAddModalVisible(false);
      addForm.resetFields();
      setNewFeaturesContent('');
    } catch (error) {
      console.error('Error al agregar tarifa:', error);
      message.error('Error al agregar la tarifa');
    }
  };

  const handleDelete = async (rateId) => {
    try {
      await deleteDocument('rates', rateId);
      message.success('Tarifa eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar tarifa:', error);
      message.error('Error al eliminar la tarifa');
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Select
          value={selectedPeriodicity}
          onChange={(value) => setSelectedPeriodicity(value)}
          style={{ width: 200 }}
        >
          <Option value="monthly">Mensual</Option>
          <Option value="quarterly">Trimestral</Option>
          <Option value="semiannual">Semestral</Option>
          <Option value="yearly">Anual</Option>
        </Select>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ marginLeft: '10px' }}
          onClick={() => setIsAddModalVisible(true)}
        >
          Agregar Tarifa
        </Button>
      </div>

      <Row gutter={[16, 16]} justify="center">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Col xs={24} md={8} key={index}>
              <Skeleton active />
            </Col>
          ))
        ) : (
          rates.map((rate) => (
            <Col xs={24} md={8} key={rate.id}>
              <Card
                style={{
                  backgroundColor: rate.backgroundColor,
                  borderRadius: '10px',
                  textAlign: 'center',
                }}
                bodyStyle={{ padding: '20px' }}
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(rate)}
                    type="link"
                  >
                    Editar
                  </Button>,
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(rate.id)}
                    type="link"
                    danger
                  >
                    Eliminar
                  </Button>,
                ]}
              >
                <h2>{rate.name}</h2>
                <h3 style={{ margin: '20px 0', fontSize: '24px' }}>
                  {selectedPeriodicity === 'monthly'
                    ? `${rate.monthlyPrice} €/mes`
                    : selectedPeriodicity === 'quarterly'
                      ? `${rate.quarterlyPrice} €/trimestre`
                      : selectedPeriodicity === 'semiannual'
                        ? `${rate.semiannualPrice} €/semestre`
                        : `${rate.yearlyPrice} €/año`}
                </h3>
                <div>
                  <strong>Revisión:</strong> {rate.revisionPeriodicity}
                </div>
                <div style={{ textAlign: 'left', padding: '10px 20px' }}>
                  <strong>Incluye:</strong>
                  <ul>
                    {rate.includes?.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div
                  style={{ textAlign: 'left', padding: '0 20px' }}
                  dangerouslySetInnerHTML={{ __html: rate.features }}
                />
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Modal para editar tarifa */}
      <Modal
        title="Editar Tarifa"
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingRate(null);
          form.resetFields();
          setFeaturesContent('');
        }}
        footer={null}
      >
        <Form
          form={form}
          initialValues={{
            name: '',
            monthlyPrice: '',
            quarterlyPrice: '',
            semiannualPrice: '',
            yearlyPrice: '',
            backgroundColor: '#ffffff',
          }}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item label="Nombre de la tarifa" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Precio Mensual" name="monthlyPrice" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Precio Trimestral" name="quarterlyPrice" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Precio Semestral" name="semiannualPrice" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Precio Anual" name="yearlyPrice" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Características (texto)">
            <RichTextEditor value={featuresContent} onChange={setFeaturesContent} />
          </Form.Item>
          <Form.Item label="Color de fondo" name="backgroundColor">
            <Input type="color" />
          </Form.Item>
          <Form.Item
            label="Periodicidad de Revisión"
            name="revisionPeriodicity"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Semanal">Semanal</Option>
              <Option value="Quincenal">Quincenal</Option>
              <Option value="Mensual">Mensual</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Incluye (selección múltiple)"
            name="includes"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Selecciona lo que incluye">
              <Option value="Rutina">Rutina</Option>
              <Option value="Dieta">Dieta</Option>
              <Option value="Soporte adicional">Soporte adicional</Option>
            </Select>
          </Form.Item>

          <Divider />
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
        </Form>
      </Modal>

      {/* Modal para agregar nueva tarifa */}
      <Modal
        title="Agregar Nueva Tarifa"
        visible={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          addForm.resetFields();
          setNewFeaturesContent('');
        }}
        footer={null}
      >
        <Form
          form={addForm}
          initialValues={{
            name: '',
            monthlyPrice: '',
            quarterlyPrice: '',
            semiannualPrice: '',
            yearlyPrice: '',
            backgroundColor: '#ffffff',
          }}
          onFinish={handleAdd}
          layout="vertical"
        >
          <Form.Item
            label="Nombre de la tarifa"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Precio Mensual"
            name="monthlyPrice"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Precio Trimestral"
            name="quarterlyPrice"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Precio Semestral"
            name="semiannualPrice"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Precio Anual"
            name="yearlyPrice"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Características (texto)">
            <RichTextEditor
              value={newFeaturesContent}
              onChange={setNewFeaturesContent}
            />
          </Form.Item>
          <Form.Item label="Color de fondo" name="backgroundColor">
            <Input type="color" />
          </Form.Item>
          <Form.Item
            label="Periodicidad de Revisión"
            name="revisionPeriodicity"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Semanal">Semanal</Option>
              <Option value="Quincenal">Quincenal</Option>
              <Option value="Mensual">Mensual</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Incluye (selección múltiple)"
            name="includes"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Selecciona lo que incluye">
              <Option value="Rutina">Rutina</Option>
              <Option value="Dieta">Dieta</Option>
              <Option value="Soporte adicional">Soporte adicional</Option>
            </Select>
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
