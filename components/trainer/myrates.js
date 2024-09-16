import React, { useContext, useEffect, useState } from 'react';
import { Card, Button, Carousel, Modal, Form, Input, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ShareAltOutlined, CopyOutlined, StarOutlined } from '@ant-design/icons';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';

const { Meta } = Card;

const MyRates = () => {
  const { myUid } = useContext(AuthContext);
  const [rates, setRates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!myUid) return;

    const unsub = onSnapshot(
      collection(db, 'rates'),
      (snapShot) => {
        const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Rates fetched: ", list); // Depuración
        setRates(list.filter((rate) => rate.rateid === myUid));
      },
      (error) => console.error("Error fetching rates: ", error)
    );
    return () => unsub();
  }, [myUid]);

  const handleAddRate = () => {
    form.validateFields().then(async (values) => {
      try {
        await setDoc(doc(db, 'rates', values.ratename), {
          ...values,
          rateid: myUid,
        });
        form.resetFields();
        setModalVisible(false);
      } catch (error) {
        console.error("Error adding rate: ", error);
      }
    });
  };

  const handleDeleteRate = async (id) => {
    try {
      await deleteDoc(doc(db, 'rates', id));
    } catch (error) {
      console.error("Error deleting rate: ", error);
    }
  };

  const handleShare = (rate) => {
    navigator.clipboard.writeText(`Tarifa: ${rate.ratename}\nPrecio: ${rate.rateprice}\nInformación: ${rate.rateinfo}`);
    message.success('Tarifa copiada al portapapeles');
  };

  return (
    <div className={styles.containerRates}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
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
              breakpoint: 768, // Vista móvil
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
              style={{ maxWidth: 300, margin: '0 10px' }}
              actions={[
                <ShareAltOutlined key="share" onClick={() => handleShare(rate)} />,
                <StarOutlined key="rate" />,
                <CopyOutlined key="copy" />,
                <Button icon={<EditOutlined />} onClick={() => { }} />,
                <Button icon={<DeleteOutlined />} onClick={() => handleDeleteRate(rate.id)} />,
              ]}
            >
              <Meta
                title={rate.ratename}
                description={<>
                  <p>Precio: {rate.rateprice}</p>
                  <div dangerouslySetInnerHTML={{ __html: rate.rateinfo }} />
                </>}
              />
            </Card>
          ))}
        </Carousel>
      )}
      <Modal
        title="Añadir Tarifa"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddRate}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="ratename"
            label="Nombre de Tarifa"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de la tarifa' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="rateprice"
            label="Precio"
            rules={[{ required: true, message: 'Por favor ingrese el precio de la tarifa' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="rateinfo"
            label="Información"
            rules={[{ required: true, message: 'Por favor ingrese la información de la tarifa' }]}
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyRates;
