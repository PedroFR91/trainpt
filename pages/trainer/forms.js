import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import TrainerHeader from "../../components/trainer/trainerHeader";
import Initial from "../../components/client/Initial";
import Follow from "../../components/client/Follow";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import styles from "../../styles/forms.module.css";
import withAuth from '../../components/withAuth';

const Forms = () => {
  const { myUid } = useContext(AuthContext);
  const [myForm, setMyForm] = useState([]);
  const [initialModalVisible, setInitialModalVisible] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forms"),
      (snapShot) => {
        const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMyForm(list.filter(form => form.trainerId === myUid));
      },
      (error) => console.error(error)
    );
    return () => unsub();
  }, [myUid]);

  const handleDeleteForm = async (id) => {
    try {
      await deleteDoc(doc(db, "forms", id));
    } catch (error) {
      console.error("Error deleting form: ", error);
    }
  };

  const columns = [
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (text, record) => (
        <span>
          <Button type="link" onClick={() => handleDeleteForm(record.id)}>Eliminar</Button>
          <Button type="link" href={`/shared/forms/${record.id}`}>Ver</Button>
        </span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.formLayout}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setInitialModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Crear Formulario Inicial
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFollowModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Crear Formulario de Seguimiento
        </Button>
        <Table columns={columns} dataSource={myForm} rowKey="id" />

        <Modal
          title="Crear Formulario Inicial"
          visible={initialModalVisible}
          onCancel={() => setInitialModalVisible(false)}
          footer={null}
        >
          <Initial setShowInitial={setInitialModalVisible} />
        </Modal>
        <Modal
          title="Crear Formulario de Seguimiento"
          visible={followModalVisible}
          onCancel={() => setFollowModalVisible(false)}
          footer={null}
        >
          <Follow setShowFollow={setFollowModalVisible} />
        </Modal>
      </div>
    </div>
  );
};

export default withAuth(Forms);
