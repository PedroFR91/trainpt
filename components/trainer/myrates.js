// components/trainer/myrates.js

import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Card,
  Button,
  Carousel,
  Modal,
  Form,
  Input,
  message,
  Select,
  Row,
  Col,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ShareAltOutlined,
  CopyOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myrates.module.css';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { initialValue } from './initialValue';
import Toolbar from './Toolbar';
import { serialize, deserialize } from './utils';

const { Meta } = Card;
const { Option } = Select;

const MyRates = () => {
  const { myUid } = useContext(AuthContext);
  const [rates, setRates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [form] = Form.useForm();
  const [editorValue, setEditorValue] = useState(initialValue);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [selectedColor, setSelectedColor] = useState('#ffffff');

  useEffect(() => {
    if (!myUid) return;

    const unsub = onSnapshot(
      collection(db, 'rates'),
      (snapShot) => {
        const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRates(list.filter((rate) => rate.rateid === myUid));
      },
      (error) => console.error('Error fetching rates: ', error)
    );
    return () => unsub();
  }, [myUid]);

  const openModal = (rate = null) => {
    if (rate) {
      // Editar tarifa existente
      setEditingRate(rate);
      form.setFieldsValue({
        ratename: rate.ratename,
        rateprice: rate.rateprice,
        ratefrequency: rate.ratefrequency,
      });
      setEditorValue(deserialize(rate.rateinfo));
      setSelectedColor(rate.backgroundColor || '#ffffff');
    } else {
      // Crear nueva tarifa
      setEditingRate(null);
      form.resetFields();
      setEditorValue(initialValue);
      setSelectedColor('#ffffff');
    }
    setModalVisible(true);
  };

  const handleAddOrEditRate = () => {
    form.validateFields().then(async (values) => {
      try {
        const rateData = {
          ...values,
          rateinfo: serialize(editorValue),
          rateid: myUid,
          backgroundColor: selectedColor,
        };

        if (editingRate) {
          // Actualizar tarifa existente
          await updateDoc(doc(db, 'rates', editingRate.id), rateData);
          message.success('Tarifa actualizada');
        } else {
          // Crear nueva tarifa
          const newDocRef = doc(collection(db, 'rates'));
          await setDoc(newDocRef, { ...rateData, id: newDocRef.id });
          message.success('Tarifa añadida');
        }

        form.resetFields();
        setEditorValue(initialValue);
        setSelectedColor('#ffffff');
        setModalVisible(false);
      } catch (error) {
        console.error('Error saving rate: ', error);
        message.error('Error al guardar la tarifa');
      }
    });
  };

  const handleDeleteRate = async (id) => {
    try {
      await deleteDoc(doc(db, 'rates', id));
      message.success('Tarifa eliminada');
    } catch (error) {
      console.error('Error deleting rate: ', error);
      message.error('Error al eliminar la tarifa');
    }
  };

  const handleShare = (rate) => {
    const tempElement = document.createElement('textarea');
    tempElement.value = `Tarifa: ${rate.ratename}\nPrecio: ${rate.rateprice} ${rate.ratefrequency}\nDetalles:\n${rate.rateinfo}`;
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement);
    message.success('Tarifa copiada al portapapeles');
  };

  const renderElement = useCallback((props) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    const { leaf, attributes, children } = props;
    let formattedText = children;

    if (leaf.bold) {
      formattedText = <strong>{formattedText}</strong>;
    }

    if (leaf.italic) {
      formattedText = <em>{formattedText}</em>;
    }

    if (leaf.underline) {
      formattedText = <u>{formattedText}</u>;
    }

    if (leaf.strikethrough) {
      formattedText = <del>{formattedText}</del>;
    }

    if (leaf.code) {
      formattedText = <code>{formattedText}</code>;
    }

    return <span {...attributes}>{formattedText}</span>;
  }, []);

  return (
    <div className={styles.containerRates}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Añadir Tarifa
      </Button>
      {rates.length === 0 ? (
        <p>No hay tarifas disponibles.</p>
      ) : (
        <Carousel
          dots={false}
          arrows
          slidesToShow={3}
          slidesToScroll={1}
          infinite={false}
          responsive={[
            {
              breakpoint: 1024, // Tablets y pantallas medianas
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: true,
              },
            },
            {
              breakpoint: 768, // Móviles
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: true,
              },
            },
          ]}
        >
          {rates.map((rate) => (
            <Card
              key={rate.id}
              className={styles.rateCard}
              style={{
                backgroundColor: rate.backgroundColor || '#ffffff',
                borderRadius: '10px',
                margin: '0 10px',
              }}
              actions={[
                <Tooltip title="Compartir" key="share">
                  <ShareAltOutlined onClick={() => handleShare(rate)} />
                </Tooltip>,
                <Tooltip title="Copiar" key="copy">
                  <CopyOutlined onClick={() => handleShare(rate)} />
                </Tooltip>,
                <Tooltip title="Editar" key="edit">
                  <EditOutlined onClick={() => openModal(rate)} />
                </Tooltip>,
                <Tooltip title="Eliminar" key="delete">
                  <DeleteOutlined onClick={() => handleDeleteRate(rate.id)} />
                </Tooltip>,
              ]}
            >
              <Meta
                title={<h2 style={{ textAlign: 'center' }}>{rate.ratename}</h2>}
                description={
                  <>
                    <div className={styles.priceContainer}>
                      <h3>{rate.rateprice} €</h3>
                      <span>/{rate.ratefrequency}</span>
                    </div>
                    <div className={styles.rateInfo}>
                      <Slate editor={editor} value={deserialize(rate.rateinfo)} onChange={() => { }}>
                        <Editable
                          readOnly
                          renderElement={renderElement}
                          renderLeaf={renderLeaf}
                        />
                      </Slate>
                    </div>
                  </>
                }
              />
            </Card>
          ))}
        </Carousel>
      )}
      <Modal
        title={editingRate ? 'Editar Tarifa' : 'Añadir Tarifa'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddOrEditRate}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ratename"
                label="Nombre de Tarifa"
                rules={[{ required: true, message: 'Por favor ingrese el nombre de la tarifa' }]}
              >
                <Input placeholder="Ejemplo: Tarifa Premium" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="rateprice"
                label="Precio (€)"
                rules={[{ required: true, message: 'Por favor ingrese el precio de la tarifa' }]}
              >
                <Input type="number" min={0} placeholder="Ejemplo: 29.99" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="ratefrequency"
                label="Frecuencia"
                rules={[{ required: true, message: 'Por favor seleccione la frecuencia' }]}
              >
                <Select placeholder="Selecciona">
                  <Option value="Mensual">Mensual</Option>
                  <Option value="Anual">Anual</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Detalles">
            <Slate editor={editor} value={editorValue} onChange={(value) => setEditorValue(value)}>
              <Toolbar />
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder="Describe las características de esta tarifa..."
              />
            </Slate>
          </Form.Item>
          <Form.Item label="Color de Fondo">
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ width: '100%', padding: 0, border: 'none' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyRates;
