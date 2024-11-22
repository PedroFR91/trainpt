// components/client/AssignedForms.js
import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Tag, message, Spin, Modal } from 'antd';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import FormViewer from '../trainer/FormViewer';
import styles from '../../styles/program.module.css';

const AssignedForms = () => {
    const { myUid } = useContext(AuthContext);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null); // Formulario seleccionado para mostrar
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (!myUid) return;

        const assignedFormsRef = collection(db, `clients/${myUid}/assignedForms`);
        const unsubscribe = onSnapshot(
            assignedFormsRef,
            async (snapshot) => {
                const formPromises = snapshot.docs.map(async (docSnap) => {
                    const form = docSnap.data();
                    const formRef = doc(db, `trainers/${form.trainerId}/forms`, form.formId);
                    const formDoc = await getDoc(formRef);

                    return {
                        id: docSnap.id,
                        ...form,
                        formName: formDoc.exists() ? formDoc.data().name : 'Formulario',
                        assignedAt: form.assignedAt?.toDate(),
                        completedAt: form.completedAt?.toDate(),
                    };
                });

                try {
                    const formsData = await Promise.all(formPromises);
                    setForms(formsData);
                } catch (error) {
                    console.error('Error al cargar los formularios:', error);
                    message.error('No se pudieron cargar los formularios');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error('Error al suscribirse a los formularios asignados:', error);
                message.error('No se pudieron cargar los formularios');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [myUid]);

    const showForm = (form) => {
        setSelectedForm(form);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedForm(null);
        setModalVisible(false);
    };

    const columns = [
        {
            title: 'Nombre del Formulario',
            dataIndex: 'formName',
            key: 'formName',
        },
        {
            title: 'Tipo',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (type === 'initial' ? 'Inicial' : 'Seguimiento'),
        },
        {
            title: 'Fecha de Asignación',
            dataIndex: 'assignedAt',
            key: 'assignedAt',
            render: (date) => (date ? date.toLocaleDateString() : '-'),
        },
        {
            title: 'Fecha de Finalización',
            dataIndex: 'completedAt',
            key: 'completedAt',
            render: (date) => (date ? date.toLocaleDateString() : '-'),
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
                <Button type="link" onClick={() => showForm(record)}>
                    {record.status === 'completed' ? 'Ver Respuesta' : 'Completar'}
                </Button>
            ),
        },
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div className={styles.formTable}>
            <Table
                columns={columns}
                dataSource={forms}
                rowKey="id"
                pagination={{ pageSize: 5 }}
            />
            <Modal
                visible={isModalVisible}
                title={selectedForm?.formName || 'Formulario'}
                onCancel={closeModal}
                footer={null}
                width={800}
            >
                {selectedForm && (
                    <FormViewer
                        trainerId={selectedForm.trainerId}
                        formId={selectedForm.formId}
                        clientId={myUid}
                        onClose={closeModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default AssignedForms;
