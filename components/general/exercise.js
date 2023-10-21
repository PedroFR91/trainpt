import {
    serverTimestamp,
    doc,
    collection,
    deleteDoc,
    updateDoc,
    addDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase.config";
import styles from "../../styles/routines.module.css";
import {
    FaDumbbell,
} from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const exercise = (props) => {

    const [exercises, setExercises] = useState([]);
    const [newexercise, setNewExercise] = useState({});
    const [message, setMessage] = useState(false);
    const [updateExerciseId, setUpdateExerciseId] = useState(null);
    const [tExercise, setTExercise] = useState([]);
    const { setShowExerciseModal } = props;

    useEffect(() => {
        if (updateExerciseId) {
            const exerciseToUpdate = exercises.find(
                (exercise) => exercise.id === updateExerciseId
            );
            setNewExercise(exerciseToUpdate);
        } else {
            setNewExercise({
                exercise_name: "",
                material: "",
                comments: "",
            });
        }
    }, [updateExerciseId, exercises]);
    // Para crear ejercicios
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const exerciseData = {
            name: newexercise.name,
            material: newexercise.material,
            comments: newexercise.comments,
        };

        if (updateExerciseId) {
            // Estamos en modo "Actualizar"
            await handleUpdateExercise(updateExerciseId, exerciseData);
            setUpdateExerciseId(null); // resetear el modo a "Crear"
        } else {
            // Estamos en modo "Crear"
            await handleCreateExercise(exerciseData);
        }

        // Limpiar el formulario (según tu implementación actual)
        setNewExercise({
            name: "",
            material: "",
            comments: "",
        });
    };
    const handleCreateExercise = async (exerciseData) => {
        try {
            await addDoc(collection(db, "exercises"), {
                ...exerciseData,
                timeStamp: serverTimestamp(),
            });
            notify("Ejercicio creado");


        } catch (error) {
            notify("Error al crear el ejercicio");
            console.log(error);
        }
    };
    const handleUpdateExercise = async (id, updateData) => {
        try {
            const docRef = doc(db, "exercises", id);
            await updateDoc(docRef, updateData);
            console.log("Document updated");
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };
    //Modales
    const handleCloseExerciseModal = () => {
        setShowExerciseModal(false);
    };
    const notify = (msg) => toast(msg);
    return (
        <div className={styles.modal}>
            <div className={styles.exContent}>
                <FaDumbbell size={50} />
                <form onSubmit={handleFormSubmit}>
                    <div>
                        <p>Ejercicio</p>
                        <input
                            type="text"
                            value={newexercise.name}
                            onChange={(e) =>
                                setNewExercise({
                                    ...newexercise,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <p>Material necesario</p>
                        <input
                            type="text"
                            value={newexercise.material}
                            onChange={(e) =>
                                setNewExercise({
                                    ...newexercise,
                                    material: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <p>Comentarios</p>
                        <textarea
                            type="text"
                            value={newexercise.comments}
                            onChange={(e) =>
                                setNewExercise({
                                    ...newexercise,
                                    comments: e.target.value,
                                })
                            }
                        />
                    </div>
                    <button type="submit" className={styles.create}>
                        {updateExerciseId ? "Actualizar Ejercicio" : "Crear Ejercicio"}
                    </button>
                </form>
                <div
                    className={styles.closebutton}
                    onClick={handleCloseExerciseModal}
                >
                    X
                </div>
                <ToastContainer style={{ position: 'fixed', top: '20vh', right: '10%' }} />
            </div>
        </div>
    )
}

export default exercise