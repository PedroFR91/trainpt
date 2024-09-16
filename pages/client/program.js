import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/program.module.css';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
import AuthContext from '../../context/AuthContext';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import MyRoutines from '../../components/client/myroutines';
import Link from 'next/link';
import MyDiet from '../../components/client/MyDiet';
import MyReviews from '../../components/client/myReviews';
import MyMeasurements from '../../components/client/MyMeasurements';
import MyPhotos from '../../components/client/MyPhotos';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import {
  Modal, Avatar, List, Button, Card, Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
} from 'antd';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const { Meta } = Card;

const program = () => {
  const { myUid } = useContext(AuthContext);
  const [componentDisabled, setComponentDisabled] = useState(true);
  const [form, setForm] = useState([]);
  const data = [
    {
      title: 'Ant Design Title 1',
    },
    {
      title: 'Ant Design Title 2',
    },
    {
      title: 'Ant Design Title 3',
    },
    {
      title: 'Ant Design Title 4',
    },
  ];

  const [isTrainersModalOpen, setIsTrainersModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setForm(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const showTrainersModal = () => {
    setIsTrainersModalOpen(true);
  };

  const handleTrainersModalOk = () => {
    setIsTrainersModalOpen(false);
  };

  const handleTrainersModalCancel = () => {
    setIsTrainersModalOpen(false);
  };

  const showReviewsModal = () => {
    setIsReviewsModalOpen(true);
  };

  const handleReviewsModalOk = () => {
    setIsReviewsModalOpen(false);
  };

  const handleReviewsModalCancel = () => {
    setIsReviewsModalOpen(false);
  };

  return (
    <div className={styles.programlayout}>
      <ClientProfile />
      <Link href={'/chat/chat'} style={{ color: '#fff' }}>
        <IoChatbubbleEllipsesOutline size={50} className={styles.chatIcon} />
      </Link>
      <h1 style={{ color: '#000000' }}>Lista entrenadores</h1>
      <Button type="primary" onClick={showTrainersModal}>
        Busca tu entrenador
      </Button>
      <Modal
        title="Busca tu entrenador"
        open={isTrainersModalOpen}
        onOk={handleTrainersModalOk}
        onCancel={handleTrainersModalCancel}
      >
        <TrainersList />
      </Modal>

      <h3>Mi Dieta</h3>
      <Card
        style={{ width: 300 }}
        cover={
          <img
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
          />
        }
      >
        <Meta
          avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
          title={<a href="https://ant.design">Card title</a>}
          description="This is the description"
        />
      </Card>

      <h3>Mis Revisiones</h3>
      <List
        itemLayout="horizontal"
        dataSource={data}
        style={{ width: '60%' }}
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              title={<a onClick={showReviewsModal}>10/04/2024</a>}
            />
          </List.Item>
        )}
      />
      <Modal title="Mis Revisiones" open={isReviewsModalOpen} onOk={handleReviewsModalOk} onCancel={handleReviewsModalCancel}>
        <>
          <Checkbox
            checked={componentDisabled}
            onChange={(e) => setComponentDisabled(e.target.checked)}
          >
            Form disabled
          </Checkbox>
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            disabled={componentDisabled}
            style={{ maxWidth: 600 }}
          >
            <Form.Item label="Checkbox" name="disabled" valuePropName="checked">
              <Checkbox>Checkbox</Checkbox>
            </Form.Item>
            <Form.Item label="Radio">
              <Radio.Group>
                <Radio value="apple"> Apple </Radio>
                <Radio value="pear"> Pear </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Input">
              <Input />
            </Form.Item>
            <p>Valor Seleccionado</p>
            <Form.Item label="Select">
              <Select>
                <Select.Option value="demo">Demo</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="TreeSelect">
              <TreeSelect
                treeData={[
                  { title: 'Light', value: 'light', children: [{ title: 'Bamboo', value: 'bamboo' }] },
                ]}
              />
            </Form.Item>
            <Form.Item label="Cascader">
              <Cascader
                options={[
                  {
                    value: 'zhejiang',
                    label: 'Zhejiang',
                    children: [
                      {
                        value: 'hangzhou',
                        label: 'Hangzhou',
                      },
                    ],
                  },
                ]}
              />
            </Form.Item>
            <Form.Item label="DatePicker">
              <DatePicker />
            </Form.Item>
            <Form.Item label="RangePicker">
              <RangePicker />
            </Form.Item>
            <Form.Item label="InputNumber">
              <InputNumber />
            </Form.Item>
            <Form.Item label="TextArea">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Switch" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="Upload" valuePropName="fileList" getValueFromEvent={normFile}>
              <Upload action="/upload.do" listType="picture-card">
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>
            <Form.Item label="Button">
              <Button>Button</Button>
            </Form.Item>
            <Form.Item label="Slider">
              <Slider />
            </Form.Item>
            <Form.Item label="ColorPicker">
              <ColorPicker />
            </Form.Item>
          </Form>
        </>
      </Modal>

      <h3>Mis Medidas</h3>
      <h3>Mis Fotos</h3>
      <MyPhotos myUid={myUid} />

      <h3>Mis Formularios</h3>
      <table className={styles.myformsTable}>
        <thead>
          <tr>
            <th>Tipo de formulario</th>
            <th>Fecha de envío</th>
            <th>Estado</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
          {form.map((formData) => (
            <tr key={formData.id} className={styles.table}>
              <td>{formData.type}</td>
              <td>{formData.timeStamp.toDate().toLocaleString()}</td>
              <td>Pendiente</td>
              <td>
                <Link href={`/shared/forms/${formData.id}?clientId=${myUid}`}>
                  Rellenar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default program;
