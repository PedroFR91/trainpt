import React, { useState } from 'react';
import { Card, Row, Col, Switch, Button, Modal, Form, Input, Divider, Skeleton } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const initialMockRates = [
  {
    id: '1',
    name: 'Plus',
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li></ul>',
    backgroundColor: '#f0f5ff',
  },
  {
    id: '2',
    name: 'Premium',
    monthlyPrice: 40,
    yearlyPrice: 400,
    features: '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li><li>Feature 4</li></ul>',
    backgroundColor: '#f5f0ff',
  },
  {
    id: '3',
    name: 'Supreme',
    monthlyPrice: 60,
    yearlyPrice: 600,
    features: '<ul><li>Feature 1</li><li>Feature 2</li><li>Feature 3</li><li>Feature 4</li><li>Feature 5</li></ul>',
    backgroundColor: '#fff5f0',
  },
];

const MyRates = () => {
  const [isYearly, setIsYearly] = useState(false); // Estado para alternar entre mensual y anual
  const [rates, setRates] = useState([]); // Estado para las tarifas (se carga desde mock)
  const [loading, setLoading] = useState(true); // Skeleton inicial
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRate, setEditingRate] = useState(null); // Tarifa que se está editando
  const [form] = Form.useForm();
  const [featuresContent, setFeaturesContent] = useState(''); // Estado para ReactQuill

  // Simula la carga de datos
  React.useEffect(() => {
    setTimeout(() => {
      setRates(initialMockRates);
      setLoading(false);
    }, 2000); // Simula un delay de 2 segundos
  }, []);

  const handleEdit = (rate) => {
    setEditingRate(rate);
    form.setFieldsValue(rate);
    setFeaturesContent(rate.features); // Establece el contenido de características
    setIsModalVisible(true);
  };

  const handleSave = (values) => {
    const updatedRates = rates.map((rate) =>
      rate.id === editingRate.id
        ? { ...editingRate, ...values, features: featuresContent }
        : rate
    );
    setRates(updatedRates);
    setIsModalVisible(false);
    setEditingRate(null);
    form.resetFields();
    setFeaturesContent('');
  };

  return (
    <div>
      {/* Switch para alternar mensual/anual */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span>Mensual</span>
        <Switch
          checked={isYearly}
          onChange={(checked) => setIsYearly(checked)}
          style={{ margin: '0 10px' }}
        />
        <span>Anual (ahorra hasta 20%)</span>
      </div>

      <Row gutter={[16, 16]} justify="center">
        {loading ? (
          // Skeleton inicial
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
                ]}
              >
                <h2>{rate.name}</h2>
                <h3 style={{ margin: '20px 0', fontSize: '24px' }}>
                  {isYearly
                    ? `${rate.yearlyPrice} €/año`
                    : `${rate.monthlyPrice} €/mes`}
                </h3>
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
            yearlyPrice: '',
            backgroundColor: '#ffffff',
          }}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item
            label="Nombre de la tarifa"
            name="name"
            rules={[{ required: true, message: 'Por favor, ingresa el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Precio Mensual"
            name="monthlyPrice"
            rules={[{ required: true, message: 'Por favor, ingresa el precio mensual' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Precio Anual"
            name="yearlyPrice"
            rules={[{ required: true, message: 'Por favor, ingresa el precio anual' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Características (texto)">
            <ReactQuill
              value={featuresContent}
              onChange={setFeaturesContent}
              theme="snow"
            />
          </Form.Item>
          <Form.Item label="Color de fondo" name="backgroundColor">
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
