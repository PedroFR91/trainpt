// components/trainer/forms.js
import React, { useContext, useEffect, useState } from 'react';
import { Button, Table, Select, message, Row, Col, Switch, Card, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Follow from '../client/Follow';
import Initial from '../client/Initial';
import { collection, onSnapshot, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/forms.module.css';
import FormViewer from './FormViewer'; // Importa el nuevo componente

const { Option } = Select;
const { Title } = Typography;

const Forms = () => {
    const { myUid } = useContext(AuthContext);
    const [myForm, setMyForm] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
    const [currentFormType, setCurrentFormType] = useState('initial'); // 'initial' or 'follow'

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'forms'),
            (snapShot) => {
                const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setMyForm(list.filter((form) => form.trainerId === myUid));
            },
            (error) => console.error(error)
        );
        return () => unsub();
    }, [myUid]);

    useEffect(() => {
        const q = query(collection(db, 'subscriptions'), where('trainerId', '==', myUid));
        const unsubClients = onSnapshot(q, (snapshot) => {
            const subscriptionData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSubscriptions(subscriptionData);
        });
        return () => unsubClients();
    }, [myUid]);

    const handleDeleteForm = async (id) => {
        try {
            await deleteDoc(doc(db, 'forms', id));
            message.success('Formulario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar formulario: ', error);
        }
    };

    const handleShareForm = async (formId) => {
        if (!selectedSubscriptionId || !formId) return;
        try {
            const subscriptionDocRef = doc(db, 'subscriptions', selectedSubscriptionId);
            const subscriptionSnapshot = await getDoc(subscriptionDocRef);

            if (subscriptionSnapshot.exists()) {
                const subscriptionData = subscriptionSnapshot.data();
                const formType = myForm.find((f) => f.id === formId).type;
                const updatedFormIds = subscriptionData.formIds || [];

                updatedFormIds.push({
                    formId: formId,
                    type: formType,
                });

                await updateDoc(subscriptionDocRef, {
                    formIds: updatedFormIds,
                    status: 'form',
                });

                message.success('Formulario compartido correctamente');
            }
        } catch (error) {
            console.error('Error al compartir el formulario:', error);
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
                    <Button type="link" onClick={() => handleDeleteForm(record.id)}>
                        Eliminar
                    </Button>
                    <Button type="link" onClick={() => setSelectedFormId(record.id)}>
                        Ver
                    </Button>
                    <Select
                        placeholder="Compartir"
                        style={{ width: 120 }}
                        onChange={(value) => {
                            setSelectedSubscriptionId(value);
                            handleShareForm(record.id);
                        }}
                    >
                        {subscriptions.map((subscription) => (
                            <Option key={subscription.id} value={subscription.id}>
                                {`Cliente: ${subscription.clientId}`}
                            </Option>
                        ))}
                    </Select>
                </span>
            ),
        },
    ];

    return (
        <div className={styles.formLayout}>
            <Row gutter={16}>
                {/* Parte Izquierda: Lista de Formularios y Creador */}
                <Col xs={24} md={12}>
                    <Card className={styles.leftCard}>
                        <Title level={3}>Formularios</Title>
                        <Table
                            columns={columns}
                            dataSource={myForm}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            onRow={(record) => ({
                                onClick: () => setSelectedFormId(record.id),
                            })}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 24 }}>
                            <Title level={4} style={{ marginRight: 16 }}>
                                Crear Formulario
                            </Title>
                            <Switch
                                checkedChildren="Seguimiento"
                                unCheckedChildren="Inicial"
                                onChange={(checked) => setCurrentFormType(checked ? 'follow' : 'initial')}
                            />
                        </div>
                        {currentFormType === 'initial' ? <Initial /> : <Follow />}
                    </Card>
                </Col>

                {/* Parte Derecha: Formulario Seleccionado */}
                <Col xs={24} md={12}>
                    {selectedFormId ? (
                        <FormViewer
                            formId={selectedFormId}
                            clientId={null} // Puedes ajustar esto según tus necesidades
                            onClose={() => setSelectedFormId(null)}
                        />
                    ) : (
                        <Card className={styles.rightCard}>
                            <Title level={4}>Selecciona un formulario para ver los detalles</Title>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default Forms;
