import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Table, Select } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import TrainerHeader from "../../components/trainer/trainerHeader";
import Initial from "../../components/client/Initial";
import Follow from "../../components/client/Follow";
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import styles from "../../styles/forms.module.css";
import withAuth from '../../components/withAuth';

const { Option } = Select;

const Forms = () => {
  const { myUid } = useContext(AuthContext);
  const [myForm, setMyForm] = useState([]);
  const [initialModalVisible, setInitialModalVisible] = useState(false);
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);

  // Obtener formularios del entrenador
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

  // Obtener lista de suscripciones del entrenador
  useEffect(() => {
    const q = query(collection(db, "subscriptions"), where("trainerId", "==", myUid));
    const unsubClients = onSnapshot(q, (snapshot) => {
      const subscriptionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscriptions(subscriptionData);
    });
    return () => unsubClients();
  }, [myUid]);

  // Manejar la eliminación de un formulario
  const handleDeleteForm = async (id) => {
    try {
      await deleteDoc(doc(db, "forms", id));
    } catch (error) {
      console.error("Error deleting form: ", error);
    }
  };

  // Manejar la acción de compartir formulario
  const handleShareForm = async () => {
    if (!selectedSubscriptionId || !selectedFormId) return;
    try {
      const subscriptionDocRef = doc(db, "subscriptions", selectedSubscriptionId);
      const subscriptionSnapshot = await getDoc(subscriptionDocRef);

      if (subscriptionSnapshot.exists()) {
        const subscriptionData = subscriptionSnapshot.data();
        const formType = myForm.find(f => f.id === selectedFormId).type;
        const updatedFormIds = subscriptionData.formIds || [];

        updatedFormIds.push({
          formId: selectedFormId,
          type: formType,
        });

        await updateDoc(subscriptionDocRef, {
          formIds: updatedFormIds,
          status: "form"
        });

        setShareModalVisible(false);
      }
    } catch (error) {
      console.error("Error compartiendo el formulario:", error);
    }
  };


  // Columnas de la tabla con acciones
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
          <Button type="link" onClick={() => { setSelectedFormId(record.id); setShareModalVisible(true); }}>Compartir</Button>
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

        {/* Modal para crear Formulario Inicial */}
        <Modal
          title="Crear Formulario Inicial"
          open={initialModalVisible}  // Cambiado 'visible' por 'open'
          onCancel={() => setInitialModalVisible(false)}
          footer={null}
        >
          <Initial setShowInitial={setInitialModalVisible} />
        </Modal>

        {/* Modal para crear Formulario de Seguimiento */}
        <Modal
          title="Crear Formulario de Seguimiento"
          open={followModalVisible}  // Cambiado 'visible' por 'open'
          onCancel={() => setFollowModalVisible(false)}
          footer={null}
        >
          <Follow setShowFollow={setFollowModalVisible} />
        </Modal>

        {/* Modal para compartir formulario */}
        <Modal
          title="Compartir Formulario"
          open={shareModalVisible}  // Cambiado 'visible' por 'open'
          onCancel={() => setShareModalVisible(false)}
          onOk={handleShareForm}
        >
          <Select
            placeholder="Selecciona una suscripción"
            onChange={(value) => setSelectedSubscriptionId(value)}
            style={{ width: '100%' }}
          >
            {subscriptions.map(subscription => (
              <Option key={subscription.id} value={subscription.id} label={`Cliente: ${subscription.clientId}, Estado: ${subscription.status}`}>
                {`Cliente: ${subscription.clientId}, Estado: ${subscription.status}`}
              </Option>
            ))}
          </Select>
        </Modal>
      </div>
    </div>
  );
};

export default withAuth(Forms);
