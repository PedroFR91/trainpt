// components/trainer/ClientForms.js

import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Tag, Spin, message, Select, Modal } from 'antd';
import { db } from '../../firebase.config';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import FormViewer from './FormViewer';
import styles from '../../styles/clientForms.module.css';

const { Option } = Select;

const ClientForms = () => {
    const { myUid } = useContext(AuthContext);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [assignedForms, setAssignedForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [showFormViewer, setShowFormViewer] = useState(false);

    useEffect(() => {
        // Obtener la lista de clientes suscritos al entrenador
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where('trainerId', '==', myUid), where('status', '==', 'active'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clientsData = snapshot.docs.map((doc) => ({
                id: doc.data().clientId,
                ...doc.data(),
            }));
            setClients(clientsData);
        });

        return () => unsubscribe();
    }, [myUid]);

    useEffect(() => {
        if (!selectedClientId) return;
        setLoading(true);
        const assignedFormsRef = collection(db, `clients/${selectedClientId}/assignedForms`);

        const unsubscribe = onSnapshot(assignedFormsRef, async (snapshot) => {
            const formsData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const assignedForm = docSnap.data();
                    const formId = assignedForm.formId;
                    const assignedAt = assignedForm.assignedAt?.toDate();

                    // Obtener detalles del formulario desde el entrenador
                    const formRef = doc(db, `trainers/${myUid}/forms`, formId);
                    const formSnap = await getDoc(formRef);
                    if (formSnap.exists()) {
                        const formData = formSnap.data();
                        return {
                            id: docSnap.id, // assignedFormId
                            assignedFormId: docSnap.id,
                            assignedAt,
                            status: assignedForm.status,
                            clientId: selectedClientId,
                            ...assignedForm,
                            formData,
                        };
                    } else {
                        console.error('No se pudo obtener el formulario asignado');
                        return null;
                    }
                })
            );
            // Filtrar los formularios que son null
            setAssignedForms(formsData.filter((form) => form !== null));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedClientId, myUid]);

    const handleOpenForm = (form) => {
        setSelectedForm(form);
        setShowFormViewer(true);
    };

    const columns = [
        {
            title: 'Tipo de Formulario',
            dataIndex: 'formData',
            key: 'type',
            render: (formData) => (
                <span>{formData.type === 'initial' ? 'Inicial' : 'Seguimiento'}</span>
            ),
        },
        {
            title: 'Fecha de Asignación',
            dataIndex: 'assignedAt',
            key: 'assignedAt',
            render: (date) => {
                const validDate = date instanceof Date ? date : new Date(date);
                return validDate.toLocaleDateString();
            },
        },

        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                    {status === 'completed' ? 'Completado' : 'Pendiente'}
                </Tag>
            ),
        },
        {
            title: 'Opciones',
            key: 'action',
            render: (_, record) => (
                <Button type="link" onClick={() => handleOpenForm(record)}>
                    Ver
                </Button>
            ),
        },
    ];

    return (
        <div className={styles.clientForms}>
            <Select
                placeholder="Selecciona un cliente"
                style={{ width: 200, marginBottom: 16 }}
                onChange={setSelectedClientId}
            >
                {clients.map((client) => (
                    <Option key={client.id} value={client.id}>
                        {client.id}
                    </Option>
                ))}
            </Select>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Table
                    columns={columns}
                    dataSource={assignedForms}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            )}

            {/* Modal para ver el formulario */}
            <Modal
                visible={showFormViewer}
                title={selectedForm?.formData.name}
                onCancel={() => setShowFormViewer(false)}
                footer={null}
                width={800}
            >
                {selectedForm ? (
                    <FormViewer
                        trainerId={myUid}
                        formId={selectedForm.formId}
                        clientId={selectedClientId}
                        assignedFormId={selectedForm.assignedFormId}
                        onClose={() => setShowFormViewer(false)}
                    />
                ) : (
                    <p>Selecciona un formulario para ver.</p>
                )}
            </Modal>
        </div>
    );
};

export default ClientForms;
