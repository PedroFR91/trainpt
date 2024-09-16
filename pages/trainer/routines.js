import React, { useState, useEffect } from 'react';
import { Button, Modal, Space, Table, notification } from 'antd';
import { db } from "../../firebase.config";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import ExerciseCreator from '../../components/general/ExerciseCreator';
import TrainingCreator from '../../components/general/TrainingCreator';
import RoutineCreator from '../../components/general/RoutineCreator';
import { FaRegEdit, FaRegTrashAlt, FaCopy, FaEye } from 'react-icons/fa';
import TrainerHeader from '../../components/trainer/trainerHeader';

const App = () => {
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
      notification.success({
        message: 'Elemento eliminado',
        description: 'El elemento ha sido eliminado exitosamente',
        placement: 'topRight',
      });
    } catch (error) {
      console.error("Error al eliminar el elemento: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al eliminar el elemento',
        placement: 'topRight',
      });
    }
  };

  const handleCopy = async (collectionName, item) => {
    const newItem = { ...item, name: `${item.name} (copia)` };
    delete newItem.id; // Remove the id property

    try {
      await addDoc(collection(db, collectionName), {
        ...newItem,
        timeStamp: serverTimestamp(),
      });
      notification.success({
        message: 'Elemento copiado',
        description: 'El elemento ha sido copiado exitosamente',
        placement: 'topRight',
      });
    } catch (error) {
      console.error("Error al copiar el elemento: ", error);
      notification.error({
        message: 'Error',
        description: 'Hubo un error al copiar el elemento',
        placement: 'topRight',
      });
    }
  };

  const columns = (collectionName) => [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <FaEye onClick={() => handleView(collectionName, record)} />
          <FaRegEdit onClick={() => handleEdit(collectionName, record)} />
          <FaCopy onClick={() => handleCopy(collectionName, record)} />
          <FaRegTrashAlt onClick={() => handleDelete(collectionName, record.id)} />
        </Space>
      ),
    },
  ];

  const handleView = (collectionName, item) => {
    if (collectionName === "exercises") {
      setCurrentExercise(item);
      setViewExerciseModal(true);
    } else if (collectionName === "trainings") {
      setCurrentTraining(item);
      setViewTrainingModal(true);
    } else if (collectionName === "routines") {
      setCurrentRoutine(item);
      setViewRoutineModal(true);
    }
  };

  const handleEdit = (collectionName, item) => {
    if (collectionName === "exercises") {
      setCurrentExercise(item);
      setShowExerciseModal(true);
    } else if (collectionName === "trainings") {
      setCurrentTraining(item);
      setShowTrainingModal(true);
    } else if (collectionName === "routines") {
      setCurrentRoutine(item);
      setShowRoutineModal(true);
    }
  };

  return (
    <>
      <TrainerHeader />
      <div style={{ width: '300px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>

        <Button type="primary" onClick={() => setShowExerciseModal(true)}>Crear Ejercicio</Button>
        <Button type="primary" onClick={() => setShowTrainingModal(true)}>Crear Entrenamiento</Button>
        <Button type="primary" onClick={() => setShowRoutineModal(true)}>Crear Rutina</Button>
        <Button type="default" onClick={() => setShowExercisesTable(!showExercisesTable)}>Ver Ejercicios</Button>
        <Button type="default" onClick={() => setShowTrainingsTable(!showTrainingsTable)}>Ver Entrenamientos</Button>
        <Button type="default" onClick={() => setShowRoutinesTable(!showRoutinesTable)}>Ver Rutinas</Button>

        {showExerciseModal && (
          <ExerciseCreator visible={showExerciseModal} setVisible={setShowExerciseModal} currentExercise={currentExercise} />
        )}
        {showTrainingModal && (
          <TrainingCreator visible={showTrainingModal} setVisible={setShowTrainingModal} currentTraining={currentTraining} />
        )}
        {showRoutineModal && (
          <RoutineCreator visible={showRoutineModal} setVisible={setShowRoutineModal} currentRoutine={currentRoutine} />
        )}

        {viewExerciseModal && (
          <Modal
            title="Ver Ejercicio"
            visible={viewExerciseModal}
            onCancel={() => setViewExerciseModal(false)}
            footer={null}
          >
            <p><strong>Nombre:</strong> {currentExercise.name}</p>
            <p><strong>Material:</strong> {currentExercise.material}</p>
            <p><strong>Comentarios:</strong> {currentExercise.comments}</p>
          </Modal>
        )}
        {viewTrainingModal && (
          <Modal
            title="Ver Entrenamiento"
            visible={viewTrainingModal}
            onCancel={() => setViewTrainingModal(false)}
            footer={null}
          >
            <p><strong>Nombre:</strong> {currentTraining.name}</p>
            <p><strong>Descripción:</strong> {currentTraining.description}</p>
            <p><strong>Ejercicios:</strong></p>
            <ul>
              {currentTraining.exercises && currentTraining.exercises.map((exercise) => (
                <li key={exercise.id}>
                  <strong>Nombre:</strong> {exercise.name}
                  <br />
                  <strong>Material:</strong> {exercise.material}
                  <br />
                  <strong>Comentarios:</strong> {exercise.comments}
                </li>
              ))}
            </ul>
          </Modal>
        )}
        {viewRoutineModal && (
          <Modal
            title="Ver Rutina"
            visible={viewRoutineModal}
            onCancel={() => setViewRoutineModal(false)}
            footer={null}
          >
            <p><strong>Nombre:</strong> {currentRoutine.name}</p>
            <p><strong>Descripción:</strong> {currentRoutine.description}</p>
            <p><strong>Entrenamientos:</strong></p>
            <ul>
              {currentRoutine.trainings && currentRoutine.trainings.map((training) => (
                <li key={training.id}>
                  <strong>Nombre:</strong> {training.name}
                  <br />
                  <strong>Descripción:</strong> {training.description}
                  <br />
                  <strong>Ejercicios:</strong>
                  <ul>
                    {training.exercises && training.exercises.map((exercise) => (
                      <li key={exercise.id}>
                        <strong>Nombre:</strong> {exercise.name}
                        <br />
                        <strong>Material:</strong> {exercise.material}
                        <br />
                        <strong>Comentarios:</strong> {exercise.comments}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Modal>
        )}

        {showExercisesTable && <Table columns={columns("exercises")} dataSource={exercises} rowKey="id" />}
        {showTrainingsTable && <Table columns={columns("trainings")} dataSource={trainings} rowKey="id" />}
        {showRoutinesTable && <Table columns={columns("routines")} dataSource={routines} rowKey="id" />}
      </div>
    </>
  );
};

export default App;
