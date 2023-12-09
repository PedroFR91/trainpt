import React, { useEffect, useState } from 'react';
import { FaRunning, FaDumbbell, FaPlus, FaRegTrashAlt, FaMinus, FaEdit } from 'react-icons/fa';
import { AiFillDatabase, AiOutlineSend } from 'react-icons/ai';
import { MdCreate } from 'react-icons/md'
import styles from "../../styles/routines.module.css";
import { addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicForm from '../../forms/DynamicForm'
import { IoIosArrowForward } from 'react-icons/io'
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
    const [viewCreate, setViewCreate] = useState(false);
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
        setStep('two')
        notify('Ejercicio añadido')
    };
    const handleRemoveExercise = (index) => {
        const newTraining = [...currentTraining];
        newTraining.splice(index, 1);
        setCurrentTraining(newTraining);
    };

    //Steps
    const next = (step) => {
        switch (step) {
            case 'one':
                setStep('two');
                break;
            case 'two':
                setStep('three');
                break;
            case 'three':
                setStep('four');
                break;
            default:
                break;
        }
    }
    const prev = (step) => {
        switch (step) {
            case 'four':
                setStep('three');
                break;
            case 'three':
                setStep('two');
                break;
            case 'two':
                setStep('one');
                break;

            default:
                break;
        }
    }

    return (
        <div className={styles.modal}>
            <div className={styles.exContent}>
                <div className={styles.trainsteps}>
                    {step === 'one' &&
                        <div
                            style={step === 'one' ? {
                                backgroundColor: '#f69d21', color: '#000000',
                                borderColor: '#000000'
                            } : { backgroundColor: '#000000' }}>
                            <div>
                                <IoIosArrowForward size={50} style={step === 'one' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => prev(step)} />
                            </div>
                            <div>
                                <h3>Define tu entrenamiento</h3>
                                <p>
                                    <FaRunning size={50} />
                                </p>
                            </div>
                            <div>
                                <IoIosArrowForward size={50} onClick={() => next(step)} />
                            </div>

                        </div>}
                    {step === 'two' && <div
                        style={step === 'two' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <div>
                            <IoIosArrowForward size={50} style={step === 'one' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => prev(step)} />
                        </div>
                        <div>
                            <h3>Añade ejercicios existentes</h3>
                            <p>
                                <AiFillDatabase size={50} />
                            </p>
                        </div>

                        <div>
                            <IoIosArrowForward size={50} onClick={() => next(step)} />
                        </div>
                    </div>}
                    {step === 'three' && <div
                        style={step === 'three' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <div>
                            <IoIosArrowForward size={50} style={step === 'one' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => prev(step)} />
                        </div>
                        <div>
                            <h3>Crea ejercicios</h3>
                            <p>
                                <FaDumbbell size={50} />
                            </p>
                        </div>
                        <div>
                            <IoIosArrowForward size={50} onClick={() => next(step)} />
                        </div>
                    </div>}

                    {step === 'four' && <div
                        style={step === 'four' ? {
                            backgroundColor: '#f69d21', color: '#000000',
                            borderColor: '#000000'
                        } : { backgroundColor: '#000000' }}>
                        <div>
                            <IoIosArrowForward size={50} style={step === 'three' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => prev(step)} />
                        </div>
                        <p>Guarda tu entrenamiento</p>

                    </div>}
                </div>
                <h3>Mi Entrenamiento</h3>
                <form>
                    <div>
                        <p>Entrenamiento:</p>
                        {step === 'one' ? <input
                            type="text"
                            value={newTrain.name}
                            onChange={(e) => setNewTrain({ ...newTrain, name: e.target.value })}
                        /> : <p>{newTrain.name}</p>}

                    </div>
                    <div>
                        <p>Descripción:</p>
                        {step === 'one' ? <textarea
                            type="text"
                            value={newTrain.description}
                            onChange={(e) => setNewTrain({ ...newTrain, description: e.target.value })}
                        /> : <p> {newTrain.description}</p>}
                    </div>
                    {currentTraining.map((exercise, index) => (
                        <>
                            <h3> Ejercicios</h3>
                            <div key={index} >
                                <div className={styles.exinfo}>
                                    <div>
                                        <p>Nombre: </p>
                                        <p>{exercise.name}</p>
                                    </div>
                                    <div>
                                        <p>Materiales: </p>
                                        <p>{exercise.material}</p>
                                    </div>
                                    <div>
                                        <p>Comentarios: </p>
                                        <p>{exercise.comments}</p>
                                    </div>

                                    <div className={styles.supersets}>
                                        {exercise.superset && exercise.superset.map((exercise, index) => (
                                            <div className={styles.superset} key={index}>
                                                <div className={styles.column}>
                                                    <div>
                                                        <p>Serie {index + 1}</p>
                                                    </div>
                                                    <div>
                                                        <p key={index}>Repeticiones:{exercise.repetitions}</p>
                                                    </div>
                                                </div>


                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleRemoveExercise(index)}
                                            className={styles.create}
                                        >
                                            <FaRegTrashAlt size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleRemoveExercise(index)}
                                            className={styles.create}
                                        >
                                            <FaEdit size={20} />
                                        </button>
                                    </div>

                                </div>


                            </div>
                        </>
                    ))}
                </form>
                {step === 'two' && (
                    <form>
                        <h3>Añade ejercicios existentes</h3>
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
                                                setStep('three')
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </table>
                    </form>
                )}
                {step === 'three' && (
                    <>

                        <h3>Añadir Ejercicios</h3>

                        <form >
                            <div>

                                {isExerciseFromList ? (
                                    <>

                                        <p>{tExercise.name}</p>
                                    </>
                                ) : (
                                    <>
                                        <p>Ejercicio:</p>
                                        <input
                                            type="text"
                                            value={tExercise.name}
                                            onChange={(e) =>
                                                setTExercise({ ...tExercise, name: e.target.value })
                                            }
                                        />
                                    </>
                                )}
                            </div>
                            <div><DynamicForm tExercise={tExercise} setTExercise={setTExercise} /></div>


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
                            <button onClick={handleAddExerciseClick} className={styles.addexercisebutton}>
                                Confirmar
                            </button>

                        </form>


                    </>

                )}
                {step === 'four' && (
                    <div>

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
                <ToastContainer style={{ position: 'fixed', top: '20vh', right: '10%' }} />
            </div>
            <div
                className={styles.closebutton}
                onClick={handleCloseTrainingModal}
            >
                X
            </div>
        </div >
    );
};

export default Training;
