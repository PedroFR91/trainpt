// components/trainer/forms.js

import React, { useContext, useEffect, useState } from 'react';
import { Button, Table, Select, message, Row, Col, Card, Modal, Tag } from 'antd';
import FormComponent from '../client/FormComponent';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/forms.module.css';
import FormViewer from './FormViewer';
import {
    listenToSubcollection,
    deleteSubcollectionDocument,
    getSubcollectionDocument,
    addSubcollectionDocument,
    listenToCollection,
} from '../../services/firebase';
import { where, query, getDocs, serverTimestamp } from 'firebase/firestore';

const { Option } = Select;

const Forms = () => {
    const { myUid } = useContext(AuthContext);
    const [myForms, setMyForms] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [showFormViewer, setShowFormViewer] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [filteredForms, setFilteredForms] = useState([]);
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedClients, setSelectedClients] = useState([]);
    const [currentForm, setCurrentForm] = useState(null);

    useEffect(() => {
        if (!myUid) return;

        const unsub = listenToSubcollection(
            'trainers',
            myUid,
            'forms',
            [],
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setMyForms(list);
            },
            (error) => console.error(error)
        );

        return () => unsub();
    }, [myUid]);

    useEffect(() => {
        if (!myUid) return;

        const unsubClients = listenToCollection(
            'subscriptions',
            [where('trainerId', '==', myUid), where('status', '==', 'active')],
            (snapshot) => {
                const subscriptionData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setSubscriptions(subscriptionData);
            },
            (error) => console.error(error)
        );
        return () => unsubClients();
    }, [myUid]);

    useEffect(() => {
        let forms = [...myForms];
        if (filterType !== 'all') {
            forms = forms.filter((form) => form.type === filterType);
        }
        setFilteredForms(forms);
    }, [myForms, filterType]);

    const handleDeleteForm = async (id) => {
        try {
            await deleteSubcollectionDocument('trainers', myUid, 'forms', id);
            message.success('Formulario eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar formulario: ', error);
        }
    };

    const handleEditForm = (formId) => {
        setSelectedFormId(formId);
        setShowFormViewer(true);
    };

    const handleCopyForm = async (formId) => {
        try {
            const formToCopy = await getSubcollectionDocument('trainers', myUid, 'forms', formId);
            if (formToCopy) {
                const newFormData = { ...formToCopy, name: `${formToCopy.name} (Copia)` };
                delete newFormData.id;
                await addSubcollectionDocument('trainers', myUid, 'forms', newFormData);
                message.success('Formulario copiado correctamente');
            }
        } catch (error) {
            console.error('Error al copiar el formulario:', error);
        }
    };

    const handleAssignForm = (form) => {
        setCurrentForm(form);
        setAssignModalVisible(true);
    };

    const handleAssign = async () => {
        try {
            for (const clientId of selectedClients) {
                await addSubcollectionDocument('clients', clientId, 'assignedForms', {
                    formId: currentForm.id,
                    assignedAt: serverTimestamp(),
                    status: 'pending',
                    trainerId: myUid,
                    type: currentForm.type,
                });
            }
            message.success('Formulario asignado a los clientes seleccionados');
            setAssignModalVisible(false);
            setSelectedClients([]);
            setCurrentForm(null);
        } catch (error) {
            console.error('Error al asignar formulario:', error);
            message.error('Error al asignar el formulario');
        }
    };

    const columns = [
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
            render: (text) => (
                <Tag color={text === 'initial' ? 'blue' : 'green'}>
                    {text === 'initial' ? 'Inicial' : 'Seguimiento'}
                </Tag>
            ),
        },
        {
            title: 'Nombre',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (text, record) => (
                <span>
                    <Button type="link" onClick={() => handleDeleteForm(record.id)}>
                        Eliminar
                    </Button>
                    <Button type="link" onClick={() => { setSelectedFormId(record.id); setShowFormViewer(true); }}>
                        Ver
                    </Button>
                    <Button type="link" onClick={() => handleEditForm(record.id)}>
                        Editar
                    </Button>
                    <Button type="link" onClick={() => handleCopyForm(record.id)}>
                        Copiar
                    </Button>
                    <Button type="link" onClick={() => handleAssignForm(record)}>
                        Asignar
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div className={styles.formLayout}>
            <Row gutter={16}>
                {/* Tarjeta de Lista de Formularios */}
                <Col xs={24} md={12}>
                    <Card title="Formularios" className={styles.card}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <Select
                                value={filterType}
                                onChange={(value) => setFilterType(value)}
                                style={{ width: 200, marginRight: 16 }}
                            >
                                <Option value="all">Todos los Formularios</Option>
                                <Option value="initial">Formularios Iniciales</Option>
                                <Option value="follow">Formularios de Seguimiento</Option>
                            </Select>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredForms}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        />
                    </Card>
                </Col>

                {/* Tarjeta de Crear Formulario */}
                <Col xs={24} md={12}>
                    <Card title="Crear Nuevo Formulario" className={styles.card}>
                        <FormComponent />
                    </Card>
                </Col>
            </Row>

            {/* Modal para ver y editar formulario */}
            <Modal
                visible={showFormViewer}
                title="Detalle del Formulario"
                onCancel={() => setShowFormViewer(false)}
                footer={null}
                width={800}
            >
                {selectedFormId ? (
                    <FormViewer
                        trainerId={myUid}
                        formId={selectedFormId}
                        clientId={null}
                        onClose={() => setShowFormViewer(false)}
                    />
                ) : (
                    <p>Selecciona un formulario para ver los detalles.</p>
                )}
            </Modal>

            {/* Modal para asignar formulario a clientes */}
            <Modal
                title="Asignar Formulario a Clientes"
                visible={assignModalVisible}
                onCancel={() => { setAssignModalVisible(false); setSelectedClients([]); setCurrentForm(null); }}
                onOk={handleAssign}
                okText="Asignar"
                cancelText="Cancelar"
            >
                <p>Selecciona los clientes a los que deseas asignar el formulario:</p>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Selecciona clientes"
                    value={selectedClients}
                    onChange={setSelectedClients}
                    optionLabelProp="label"
                >
                    {subscriptions.map((subscription) => (
                        <Option key={subscription.clientId} value={subscription.clientId} label={subscription.clientId}>
                            {`Cliente: ${subscription.clientId}`}
                        </Option>
                    ))}
                </Select>
            </Modal>
        </div>
    );
};

export default Forms;
