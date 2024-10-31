// components/trainer/forms.js
import React, { useContext, useEffect, useState } from "react";
import { Button, Modal, Table, Select, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import Follow from "../client/Follow";
import Initial from "../client/Initial";
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import styles from "../../styles/forms.module.css";

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

    useEffect(() => {
        const q = query(collection(db, "subscriptions"), where("trainerId", "==", myUid));
        const unsubClients = onSnapshot(q, (snapshot) => {
            const subscriptionData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubscriptions(subscriptionData);
        });
        return () => unsubClients();
    }, [myUid]);

    const handleDeleteForm = async (id) => {
        try {
            await deleteDoc(doc(db, "forms", id));
            message.success("Formulario eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar formulario: ", error);
        }
    };

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
                message.success("Formulario compartido correctamente");
            }
        } catch (error) {
            console.error("Error al compartir el formulario:", error);
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
                    <Button type="link" onClick={() => { setSelectedFormId(record.id); setShareModalVisible(true); }}>Compartir</Button>
                </span>
            ),
        },
    ];

    return (
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
                open={initialModalVisible}
                onCancel={() => setInitialModalVisible(false)}
                footer={null}
            >
                <Initial setShowInitial={setInitialModalVisible} />
            </Modal>

            <Modal
                title="Crear Formulario de Seguimiento"
                open={followModalVisible}
                onCancel={() => setFollowModalVisible(false)}
                footer={null}
            >
                <Follow setShowFollow={setFollowModalVisible} />
            </Modal>

            <Modal
                title="Compartir Formulario"
                open={shareModalVisible}
                onCancel={() => setShareModalVisible(false)}
                onOk={handleShareForm}
            >
                <Select
                    placeholder="Selecciona una suscripción"
                    onChange={(value) => setSelectedSubscriptionId(value)}
                    style={{ width: '100%' }}
                >
                    {subscriptions.map(subscription => (
                        <Option key={subscription.id} value={subscription.id}>
                            {`Cliente: ${subscription.clientId}, Estado: ${subscription.status}`}
                        </Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default Forms;
