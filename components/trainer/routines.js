// components/trainer/routines.js

import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Space, Table, notification, Form, Select } from 'antd';
import { db } from "../../firebase.config";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot, query, where, getDoc, updateDoc, getDocs } from "firebase/firestore";
import ExerciseCreator from '../general/ExerciseCreator';
import TrainingCreator from '../general/TrainingCreator';
import RoutineCreator from '../general/RoutineCreator';
import { FaRegEdit, FaRegTrashAlt, FaCopy, FaEye } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';

const Routines = () => {
    const [form] = Form.useForm();
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [showTrainingModal, setShowTrainingModal] = useState(false);
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [exercises, setExercises] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [currentExercise, setCurrentExercise] = useState(null);
    const [currentTraining, setCurrentTraining] = useState(null);
    const [currentRoutine, setCurrentRoutine] = useState(null);
    const [viewExerciseModal, setViewExerciseModal] = useState(false);
    const [viewTrainingModal, setViewTrainingModal] = useState(false);
    const [viewRoutineModal, setViewRoutineModal] = useState(false);
    const [showExercisesTable, setShowExercisesTable] = useState(false);
    const [showTrainingsTable, setShowTrainingsTable] = useState(false);
    const [showRoutinesTable, setShowRoutinesTable] = useState(false);
    const [showShareRoutineModal, setShowShareRoutineModal] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const { myUid } = useContext(AuthContext);

    useEffect(() => {
        const unsubExercises = onSnapshot(collection(db, "exercises"), (snapshot) => {
            setExercises(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        const unsubTrainings = onSnapshot(collection(db, "trainings"), (snapshot) => {
            setTrainings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        const unsubRoutines = onSnapshot(collection(db, "routines"), (snapshot) => {
            setRoutines(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubExercises();
            unsubTrainings();
            unsubRoutines();
        };
    }, []);

    const handleDelete = async (collectionName, id) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            notification.success({ message: 'Elemento eliminado' });
        } catch (error) {
            notification.error({ message: 'Error al eliminar el elemento' });
        }
    };

    const handleCopy = async (collectionName, item) => {
        const newItem = { ...item, name: `${item.name} (copia)` };
        delete newItem.id;
        try {
            await addDoc(collection(db, collectionName), { ...newItem, timeStamp: serverTimestamp() });
            notification.success({ message: 'Elemento copiado' });
        } catch (error) {
            notification.error({ message: 'Error al copiar el elemento' });
        }
    };

    const columns = (collectionName) => [
        { title: 'Nombre', dataIndex: 'name', key: 'name' },
        {
            title: 'Acciones',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <FaEye onClick={() => handleView(collectionName, record)} />
                    <FaRegEdit onClick={() => handleEdit(collectionName, record)} />
                    <FaCopy onClick={() => handleCopy(collectionName, record)} />
                    <FaRegTrashAlt onClick={() => handleDelete(collectionName, record.id)} />
                </Space>
            ),
        },
    ];

    const handleView = (collectionName, item) => {
        if (collectionName === "exercises") setCurrentExercise(item), setViewExerciseModal(true);
        else if (collectionName === "trainings") setCurrentTraining(item), setViewTrainingModal(true);
        else if (collectionName === "routines") setCurrentRoutine(item), setViewRoutineModal(true);
    };

    const handleEdit = (collectionName, item) => {
        if (collectionName === "exercises") setCurrentExercise(item), setShowExerciseModal(true);
        else if (collectionName === "trainings") setCurrentTraining(item), setShowTrainingModal(true);
        else if (collectionName === "routines") setCurrentRoutine(item), setShowRoutineModal(true);
    };

    return (
        <div >
            <Button onClick={() => setShowExerciseModal(true)}>Crear Ejercicio</Button>
            <Button onClick={() => setShowTrainingModal(true)}>Crear Entrenamiento</Button>
            <Button onClick={() => setShowRoutineModal(true)}>Crear Rutina</Button>
            <Button onClick={() => setShowExercisesTable(!showExercisesTable)}>Ver Ejercicios</Button>
            <Button onClick={() => setShowTrainingsTable(!showTrainingsTable)}>Ver Entrenamientos</Button>
            <Button onClick={() => setShowRoutinesTable(!showRoutinesTable)}>Ver Rutinas</Button>

            {showExercisesTable && <Table columns={columns("exercises")} dataSource={exercises} rowKey="id" />}
            {showTrainingsTable && <Table columns={columns("trainings")} dataSource={trainings} rowKey="id" />}
            {showRoutinesTable && <Table columns={columns("routines")} dataSource={routines} rowKey="id" />}

            <Modal title="Crear Ejercicio" visible={showExerciseModal} onCancel={() => setShowExerciseModal(false)}>
                <ExerciseCreator visible={showExerciseModal} setVisible={setShowExerciseModal} currentExercise={currentExercise} />
            </Modal>
            <Modal title="Crear Entrenamiento" visible={showTrainingModal} onCancel={() => setShowTrainingModal(false)}>
                <TrainingCreator visible={showTrainingModal} setVisible={setShowTrainingModal} currentTraining={currentTraining} />
            </Modal>
            <Modal title="Crear Rutina" visible={showRoutineModal} onCancel={() => setShowRoutineModal(false)}>
                <RoutineCreator visible={showRoutineModal} setVisible={setShowRoutineModal} currentRoutine={currentRoutine} />
            </Modal>
        </div>
    );
};

export default Routines;
