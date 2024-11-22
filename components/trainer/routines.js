// components/trainer/routines.js

import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Space, Table, notification, Card, Row, Col, Select } from 'antd'; // Importamos Select
import { db } from "../../firebase.config";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot, query, where, getDoc } from "firebase/firestore"; // Añadimos query, where, getDoc
import ExerciseCreator from '../general/ExerciseCreator';
import TrainingCreator from '../general/TrainingCreator';
import RoutineCreator from '../general/RoutineCreator';
import { FaRegEdit, FaRegTrashAlt, FaCopy, FaEye, FaUserPlus } from 'react-icons/fa'; // Importamos FaUserPlus
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/routines.module.css';
import { FullscreenOutlined, CloseOutlined } from '@ant-design/icons';

const Routines = () => {
    const [expandedCard, setExpandedCard] = useState(null);
    const toggleExpand = (cardKey) => {
        setExpandedCard(expandedCard === cardKey ? null : cardKey);
    };

    const { myUid } = useContext(AuthContext);

    const [exercises, setExercises] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [routines, setRoutines] = useState([]);

    useEffect(() => {
        const unsubExercises = onSnapshot(
            collection(db, `trainers/${myUid}/exercises`),
            (snapshot) => {
                setExercises(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }
        );
        const unsubTrainings = onSnapshot(
            collection(db, `trainers/${myUid}/trainings`),
            (snapshot) => {
                setTrainings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }
        );
        const unsubRoutines = onSnapshot(
            collection(db, `trainers/${myUid}/routines`),
            (snapshot) => {
                setRoutines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }
        );

        return () => {
            unsubExercises();
            unsubTrainings();
            unsubRoutines();
        };
    }, [myUid]);


    const renderCardContent = (cardKey, component) => (
        <Card
            title={cardKey}
            bordered={false}
            className={`${styles.dashboardCard} ${expandedCard === cardKey ? styles.expandedCard : ''}`}
            extra={
                <Button
                    icon={expandedCard === cardKey ? <CloseOutlined /> : <FullscreenOutlined />}
                    onClick={() => toggleExpand(cardKey)}
                    type="text"
                />
            }
            style={expandedCard ? { width: '100%', height: '100%' } : {}}
        >
            {component}
        </Card>
    );

    const ExercisesComponent = ({ exercises }) => {
        const [showExerciseModal, setShowExerciseModal] = useState(false);
        const [currentExercise, setCurrentExercise] = useState(null);
        const [viewExerciseModal, setViewExerciseModal] = useState(false);

        const handleDelete = async (id) => {
            try {
                await deleteDoc(doc(db, `trainers/${myUid}/exercises`, id));
                notification.success({ message: 'Ejercicio eliminado' });
            } catch (error) {
                notification.error({ message: 'Error al eliminar el ejercicio' });
            }
        };


        const handleCopy = async (item) => {
            const newItem = { ...item, name: `${item.name} (copia)` };
            delete newItem.id;
            try {
                await addDoc(collection(db, `trainers/${myUid}/exercises`), { ...newItem, timeStamp: serverTimestamp() });
                notification.success({ message: 'Ejercicio copiado' });
            } catch (error) {
                notification.error({ message: 'Error al copiar el ejercicio' });
            }
        };


        const columns = [
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
            {
                title: 'Acciones',
                key: 'action',
                render: (_, record) => (
                    <Space>
                        <FaEye onClick={() => { setCurrentExercise(record); setViewExerciseModal(true); }} />
                        <FaRegEdit onClick={() => { setCurrentExercise(record); setShowExerciseModal(true); }} />
                        <FaCopy onClick={() => handleCopy(record)} />
                        <FaRegTrashAlt onClick={() => handleDelete(record.id)} />
                    </Space>
                ),
            },
        ];

        return (
            <>
                <Button type="primary" onClick={() => { setCurrentExercise(null); setShowExerciseModal(true); }} style={{ marginBottom: 16 }}>
                    Crear Ejercicio
                </Button>
                <Table
                    columns={columns}
                    dataSource={exercises}
                    rowKey="id"
                    pagination={false}
                    style={{ overflowX: 'auto' }}
                />
                <Modal
                    title={currentExercise ? "Editar Ejercicio" : "Crear Ejercicio"}
                    visible={showExerciseModal}
                    onCancel={() => { setShowExerciseModal(false); setCurrentExercise(null); }}
                    footer={null}
                    destroyOnClose
                >
                    <ExerciseCreator
                        visible={showExerciseModal}
                        setVisible={setShowExerciseModal}
                        currentExercise={currentExercise}
                        onClose={() => { setShowExerciseModal(false); setCurrentExercise(null); }}
                    />
                </Modal>
                <Modal
                    title="Ver Ejercicio"
                    visible={viewExerciseModal}
                    onCancel={() => { setViewExerciseModal(false); setCurrentExercise(null); }}
                    footer={null}
                    destroyOnClose
                >
                    {/* Aquí puedes agregar el contenido para ver los detalles del ejercicio */}
                </Modal>
            </>
        );
    };

    const TrainingsComponent = ({ trainings }) => {
        const [showTrainingModal, setShowTrainingModal] = useState(false);
        const [currentTraining, setCurrentTraining] = useState(null);
        const [viewTrainingModal, setViewTrainingModal] = useState(false);

        const handleDelete = async (id) => {
            try {
                await deleteDoc(doc(db, `trainers/${myUid}/trainings`, id));
                notification.success({ message: 'Entrenamiento eliminado' });
            } catch (error) {
                notification.error({ message: 'Error al eliminar el entrenamiento' });
            }
        };


        const handleCopy = async (item) => {
            const newItem = { ...item, name: `${item.name} (copia)` };
            delete newItem.id;
            try {
                await addDoc(collection(db, `trainers/${myUid}/trainings`), { ...newItem, timeStamp: serverTimestamp() });
                notification.success({ message: 'Entrenamiento copiado' });
            } catch (error) {
                notification.error({ message: 'Error al copiar el entrenamiento' });
            }
        };


        const columns = [
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
            {
                title: 'Acciones',
                key: 'action',
                render: (_, record) => (
                    <Space>
                        <FaEye onClick={() => { setCurrentTraining(record); setViewTrainingModal(true); }} />
                        <FaRegEdit onClick={() => { setCurrentTraining(record); setShowTrainingModal(true); }} />
                        <FaCopy onClick={() => handleCopy(record)} />
                        <FaRegTrashAlt onClick={() => handleDelete(record.id)} />
                    </Space>
                ),
            },
        ];

        return (
            <>
                <Button type="primary" onClick={() => { setCurrentTraining(null); setShowTrainingModal(true); }} style={{ marginBottom: 16 }}>
                    Crear Entrenamiento
                </Button>
                <Table
                    columns={columns}
                    dataSource={trainings}
                    rowKey="id"
                    pagination={false}
                    style={{ overflowX: 'auto' }}
                />
                <Modal
                    title={currentTraining ? "Editar Entrenamiento" : "Crear Entrenamiento"}
                    visible={showTrainingModal}
                    onCancel={() => { setShowTrainingModal(false); setCurrentTraining(null); }}
                    footer={null}
                    destroyOnClose
                >
                    <TrainingCreator
                        visible={showTrainingModal}
                        setVisible={setShowTrainingModal}
                        currentTraining={currentTraining}
                        onClose={() => { setShowTrainingModal(false); setCurrentTraining(null); }}
                    />
                </Modal>
                <Modal
                    title="Ver Entrenamiento"
                    visible={viewTrainingModal}
                    onCancel={() => { setViewTrainingModal(false); setCurrentTraining(null); }}
                    footer={null}
                    destroyOnClose
                >
                    {/* Aquí puedes agregar el contenido para ver los detalles del entrenamiento */}
                </Modal>
            </>
        );
    };

    const RoutinesComponent = ({ routines }) => {
        const [showRoutineModal, setShowRoutineModal] = useState(false);
        const [currentRoutine, setCurrentRoutine] = useState(null);
        const [viewRoutineModal, setViewRoutineModal] = useState(false);

        // Añadimos estados para asignar rutina
        const [assignModalVisible, setAssignModalVisible] = useState(false);
        const [selectedClients, setSelectedClients] = useState([]);
        const [clients, setClients] = useState([]);

        const { myData } = useContext(AuthContext);

        useEffect(() => {
            // Obtener lista de clientes activos
            const unsubClients = onSnapshot(
                query(collection(db, 'subscriptions'), where('trainerId', '==', myUid), where('status', '==', 'active')),
                async (snapshot) => {
                    const clientIds = snapshot.docs.map((doc) => doc.data().clientId);
                    const clientData = [];
                    for (const clientId of clientIds) {
                        const clientDocRef = doc(db, 'clients', clientId);
                        const clientDocSnap = await getDoc(clientDocRef);
                        if (clientDocSnap.exists()) {
                            clientData.push({ id: clientId, ...clientDocSnap.data() });
                        }
                    }
                    setClients(clientData);
                }
            );

            return () => {
                unsubClients();
            };
        }, [myUid]);

        const handleDelete = async (id) => {
            try {
                await deleteDoc(doc(db, `trainers/${myUid}/routines`, id));
                notification.success({ message: 'Rutina eliminada' });
            } catch (error) {
                notification.error({ message: 'Error al eliminar la rutina' });
            }
        };


        const handleCopy = async (item) => {
            const newItem = { ...item, name: `${item.name} (copia)` };
            delete newItem.id;
            try {
                await addDoc(collection(db, `trainers/${myUid}/routines`), { ...newItem, timeStamp: serverTimestamp() });
                notification.success({ message: 'Rutina copiada' });
            } catch (error) {
                notification.error({ message: 'Error al copiar la rutina' });
            }
        };

        // Función para abrir el modal de asignación
        const handleAssignRoutine = (routine) => {
            setCurrentRoutine(routine);
            setAssignModalVisible(true);
        };

        // Función para asignar la rutina a los clientes seleccionados
        const handleAssign = async () => {
            try {
                for (const clientId of selectedClients) {
                    await addDoc(collection(db, `clients/${clientId}/assignedRoutines`), {
                        routineId: currentRoutine.id,
                        assignedAt: serverTimestamp(),
                        status: 'active',
                        trainerId: myUid,
                    });
                }
                notification.success({ message: 'Rutina asignada a los clientes seleccionados' });
                setAssignModalVisible(false);
                setSelectedClients([]);
                setCurrentRoutine(null);
            } catch (error) {
                console.error('Error al asignar rutina:', error);
                notification.error({ message: 'Error al asignar la rutina' });
            }
        };

        const columns = [
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
            {
                title: 'Acciones',
                key: 'action',
                render: (_, record) => (
                    <Space>
                        <FaEye onClick={() => { setCurrentRoutine(record); setViewRoutineModal(true); }} />
                        <FaRegEdit onClick={() => { setCurrentRoutine(record); setShowRoutineModal(true); }} />
                        <FaCopy onClick={() => handleCopy(record)} />
                        <FaUserPlus onClick={() => handleAssignRoutine(record)} /> {/* Botón para asignar rutina */}
                        <FaRegTrashAlt onClick={() => handleDelete(record.id)} />
                    </Space>
                ),
            },
        ];

        return (
            <>
                <Button type="primary" onClick={() => { setCurrentRoutine(null); setShowRoutineModal(true); }} style={{ marginBottom: 16 }}>
                    Crear Rutina
                </Button>
                <Table
                    columns={columns}
                    dataSource={routines}
                    rowKey="id"
                    pagination={false}
                    style={{ overflowX: 'auto' }}
                />
                <Modal
                    title={currentRoutine ? "Editar Rutina" : "Crear Rutina"}
                    visible={showRoutineModal}
                    onCancel={() => { setShowRoutineModal(false); setCurrentRoutine(null); }}
                    footer={null}
                    destroyOnClose
                >
                    <RoutineCreator
                        visible={showRoutineModal}
                        setVisible={setShowRoutineModal}
                        currentRoutine={currentRoutine}
                        onClose={() => { setShowRoutineModal(false); setCurrentRoutine(null); }}
                    />
                </Modal>
                <Modal
                    title="Ver Rutina"
                    visible={viewRoutineModal}
                    onCancel={() => { setViewRoutineModal(false); setCurrentRoutine(null); }}
                    footer={null}
                    destroyOnClose
                >
                    {/* Aquí puedes agregar el contenido para ver los detalles de la rutina */}
                </Modal>
                {/* Modal para asignar rutina a clientes */}
                <Modal
                    title="Asignar Rutina a Clientes"
                    visible={assignModalVisible}
                    onCancel={() => { setAssignModalVisible(false); setSelectedClients([]); setCurrentRoutine(null); }}
                    onOk={handleAssign}
                    okText="Asignar"
                    cancelText="Cancelar"
                >
                    <p>Selecciona los clientes a los que deseas asignar la rutina:</p>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Selecciona clientes"
                        value={selectedClients}
                        onChange={setSelectedClients}
                        optionLabelProp="label"
                    >
                        {clients.map((client) => (
                            <Select.Option key={client.id} value={client.id} label={client.username || client.email}>
                                {client.username || client.email}
                            </Select.Option>
                        ))}
                    </Select>
                </Modal>
            </>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            {expandedCard ? (
                <Row justify="start" align="top" style={{ width: '100%' }}>
                    {expandedCard === 'Ejercicios' && renderCardContent('Ejercicios', <ExercisesComponent exercises={exercises} />)}
                    {expandedCard === 'Entrenamientos' && renderCardContent('Entrenamientos', <TrainingsComponent trainings={trainings} />)}
                    {expandedCard === 'Rutinas' && renderCardContent('Rutinas', <RoutinesComponent routines={routines} />)}
                </Row>
            ) : (
                <Row gutter={[16, 16]} align="top" style={{ width: '100%' }}>
                    <Col xs={24} md={12} lg={8}>
                        {renderCardContent('Ejercicios', <ExercisesComponent exercises={exercises} />)}
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        {renderCardContent('Entrenamientos', <TrainingsComponent trainings={trainings} />)}
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        {renderCardContent('Rutinas', <RoutinesComponent routines={routines} />)}
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default Routines;
