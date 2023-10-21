import React, { useEffect, useState } from 'react';
import { FaRunning, FaDumbbell, FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { AiFillDatabase, AiOutlineSend } from 'react-icons/ai';
import { MdCreate } from 'react-icons/md'
import styles from "../../styles/routines.module.css";
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicForm from '../../forms/DynamicForm'
const Training = (props) => {
    const [newTrain, setNewTrain] = useState({
        name: "",
        material: "",
        comments: "",
    })
    const [toggle, setToggle] = useState(false);
    const [message, setMessage] = useState(false);
    const [addNewEx, setAddNewEx] = useState(false);
    const [selectExercises, setSelectExercises] = useState(false);
    const { setShowTrainingModal } = props;
    const [myMessage, setMyMessage] = useState("");
    const [currentTraining, setCurrentTraining] = useState([]);
    const [tExercise, setTExercise] = useState([]);
    const [updateTrainingId, setUpdateTrainingId] = useState(null);
    const [isExerciseFromList, setIsExerciseFromList] = useState(false);
    const [exercises, setExercises] = useState([]);

    const [step, setStep] = useState('one');
    // Para crear entrenamientos
    useEffect(() => {
        const unsubExercises = onSnapshot(
            collection(db, "exercises"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setExercises(list);
            },
            (error) => {
                console.log(error);
            }
        );
        return () => {
            unsubExercises();
        };
    }, []);
    const handleCreateTraining = async (e) => {
        e.preventDefault();

        const trainingData = {
            name: newTrain.name,
            description: newTrain.description,
            // exercises: trainingData.exerciseData,
        };
        try {
            await addDoc(collection(db, "trainings"), {
                ...trainingData,
                exercises: currentTraining,
                timeStamp: serverTimestamp(),
            });
            notify("Entrenamiento Creado");

            setNewTrain({
                name: "",
                description: "",
                exercises: [],
            })

        } catch (error) {
            notify("Error al crear el entrenamiento");
            console.log(error);
        }
    };
    const notify = (msg) => toast(msg);
    const handleDeleteTraining = async (id) => {
        try {
            await deleteDoc(doc(db, "trainings", id));
            console.log("Document deleted");
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };
    const handleUpdateTraining = async (e, id, updatedTraining) => {
        e.preventDefault();
        const trainingData = {
            name: newTrain.name,
            description: newTrain.description,
            // exercises: trainingData.exerciseData,
        };
        try {
            const docRef = doc(db, "trainings", id);
            await updateDoc(docRef, {
                updatedTraining,
                ...trainingData,
                exercises: currentTraining,
            });
            console.log("Document updated");
            setMyMessage("actualizado");
            setMessage(true);
            setNewTrain({
                name: "",
                description: "",
                exercises: [],
            })
            setTimeout(() => {
                setMessage(false);
            }, 3000);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };
    const handleCopyTraining = async (id, updatedTraining) => {
        try {
            const docRef = doc(db, "trainings", id);
            await addDoc(docRef, updatedTraining);
            console.log("Document updated");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };
    const handleAssignExercise = async (e, trainingId) => {
        e.preventDefault();
        const exerciseId = e.target.value;
        try {
            const trainingRef = doc(db, "trainings", trainingId);
            const trainingData = (await getDoc(trainingRef)).data();

            const updatedExercises = [...trainingData.exercises, exerciseId];
            await updateDoc(trainingRef, { exercises: updatedExercises });
        } catch (error) {
            console.error("Error al asignar el ejercicio al entrenamiento: ", error);
        }
    };
    const handleAssignTraining = async (e, routineId) => {
        e.preventDefault();
        const trainingId = e.target.value; // Aquí asumo que el id del entrenamiento se encuentra en el valor del botón
        try {
            const trainingRef = doc(db, "trainings", trainingId);
            const routineRef = doc(db, "routines", routineId);
            const routineData = (await getDoc(routineRef)).data();

            const updatedRoutine = {
                ...routineData,
                trainings: [...routineData.trainings, { ...trainingRef }],
            };

            await setDoc(routineRef, updatedRoutine);
        } catch (error) {
            console.error("Error al asignar el entrenamiento a la rutina: ", error);
        }
    };

    const handleCloseTrainingModal = () => {
        setShowTrainingModal(false);
        // setCurrent(false);
        // setTrainingData('');
        // Restablece cualquier estado relacionado con el modal de entrenamiento aquí
    };
    const handleAddExerciseClick = (e) => {
        console.log(tExercise)
        e.preventDefault();
        setCurrentTraining([...currentTraining, tExercise]);
        setAddNewEx(false);
        setSelectExercises(false);
        setTExercise([]);
        notify('Ejercicio añadido')
    };
    const handleRemoveExercise = (index) => {
        const newTraining = [...currentTraining];
        newTraining.splice(index, 1);
        setCurrentTraining(newTraining);
    };

    return (
        <div className={styles.modal}>
            <div className={styles.exContent}>
                <div className={styles.trainsteps}>
                    <div onClick={() => { setStep('one') }}
                        style={step === 'one' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <p>Define tu entrenamiento</p>
                        <p>
                            <FaRunning size={50} />
                        </p>
                    </div>
                    <div onClick={() => { setStep('two') }}
                        style={step === 'two' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <p>Crea ejercicios</p>
                        <p>
                            <MdCreate size={50} />
                        </p>
                    </div>
                    <div onClick={() => { setStep('three') }}
                        style={step === 'three' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <p>Añade ejercicios existentes</p>
                        <p>
                            <AiFillDatabase size={50} />

                        </p>
                    </div>
                    <div onClick={() => { setStep('four') }}
                        style={step === 'four' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <p>Guarda tu entrenamiento</p>
                        <p>
                            <AiOutlineSend size={50} />
                        </p>
                    </div>
                </div>
                {step === 'one' && <>
                    <FaRunning size={50} />
                    <form>
                        <div>
                            <p>Entrenamiento:</p>
                            <input
                                type="text"
                                value={newTrain.name}
                                onChange={(e) => setNewTrain({ ...newTrain, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <p>Descripción:</p>
                            <textarea
                                type="text"
                                value={newTrain.description}
                                onChange={(e) => setNewTrain({ ...newTrain, description: e.target.value })}
                            />
                        </div>
                    </form>
                </>}
                {step === 'two' && (
                    <>
                        <FaDumbbell size={50} />
                        <form>
                            <div>
                                <p>Ejercicio:</p>
                                {isExerciseFromList ? (
                                    <p>{tExercise.name}</p>
                                ) : (
                                    <input
                                        type="text"
                                        value={tExercise.name}
                                        onChange={(e) =>
                                            setTExercise({ ...tExercise, name: e.target.value })
                                        }
                                    />
                                )}
                            </div>
                            <div className={styles.superset}>
                                <DynamicForm tExercise={tExercise} setTExercise={setTExercise} />
                            </div>
                            <div>
                                <p>Comentarios:</p>
                                <textarea
                                    type="text"
                                    value={tExercise.comments}
                                    onChange={(e) =>
                                        setTExercise({ ...tExercise, comments: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <p>Materiales:</p>
                                <input
                                    type="text"
                                    value={tExercise.material}
                                    onChange={(e) =>
                                        setTExercise({ ...tExercise, material: e.target.value })
                                    }
                                />
                            </div>
                            <button onClick={handleAddExerciseClick} className={styles.create}>
                                Confirmar
                            </button>
                        </form>
                    </>
                )}
                {step === 'three' && (
                    <>
                        <AiFillDatabase size={50} />
                        <form>
                            <h3>Banco de Ejercicios</h3>
                            <table>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Equipamiento</th>
                                    <th>Comentarios</th>
                                    <th>Opciones</th>
                                </tr>
                                {exercises.map((exercise) => (
                                    <tr key={exercise} className={styles.exddbb}>
                                        <td>{exercise.name}</td>
                                        <td>{exercise.material}</td>
                                        <td>{exercise.comments}</td>
                                        <td>
                                            <FaPlus
                                                size={20}
                                                onClick={(e) => {
                                                    console.log('HOLA')
                                                    setTExercise({
                                                        name: exercise.name,
                                                        comments: exercise.comments,
                                                        material: exercise.material,
                                                    });
                                                    setStep('two')
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </table>
                        </form>

                    </>
                )}
                {step === 'four' && (
                    <div >
                        <h3>Entrenamiento en Proceso</h3>
                        <div>
                            {newTrain.name && <p>Nombre: {newTrain.name}</p>}
                            {newTrain.description && (
                                <p>Descripción: {newTrain.description}</p>
                            )}
                        </div>
                        <div className={styles.myexs}>
                            {currentTraining.map((exercise, index) => (
                                <div key={index} className={styles.thisTraining}>
                                    <div>
                                        <p>Nombre: </p>
                                        <p>{exercise.name}</p>
                                    </div>
                                    <div>
                                        <div className={styles.supersets}>
                                            {exercise.superset && exercise.superset.map((exercise, index) => (
                                                <div className={styles.superset} key={index}>
                                                    <div>
                                                        <p>Serie {index + 1}</p>
                                                    </div>
                                                    <div>
                                                        <p>Repeticiones:</p>
                                                        <p key={index}>{exercise.repetitions}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p>Materiales: </p>
                                        <p>{exercise.material}</p>
                                    </div>
                                    <div>
                                        <p>Comentarios: </p>
                                        <p>{exercise.comments}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveExercise(index)}
                                        className={styles.create}
                                    >
                                        <FaRegTrashAlt size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={(e) =>
                                updateTrainingId
                                    ? handleUpdateTraining(e, updateTrainingId, newTrain)
                                    : handleCreateTraining(e)
                            }
                            className={styles.create}
                            disabled={!tExercise}
                        >
                            {updateTrainingId
                                ? "Actualizar Entrenamiento"
                                : "Crear Entrenamiento"}
                        </button>
                    </div>
                )}
                <div
                    className={styles.closebutton}
                    onClick={handleCloseTrainingModal}
                >
                    X
                </div>
                <ToastContainer style={{ position: 'fixed', top: '20vh', right: '10%' }} />
            </div>
        </div >
    );
};

export default Training;
