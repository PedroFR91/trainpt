import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import styles from '../../styles/train.module.css';
import { db } from '../../firebase.config';
import { Modal, Box, Typography } from '@mui/material';
import { Button, List } from "antd";
const myroutines = ({ myUid }) => {
    const [routines, setRoutines] = useState([]);
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [realRepsValues, setRealRepsValues] = useState({});
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'routines'), (snapshot) => {
            const routinesData = [];
            snapshot.forEach((doc) => {
                const routineData = doc.data();
                routineData.id = doc.id;
                routinesData.push(routineData);
            });
            setRoutines(routinesData);
        });

        return () => {
            unsubscribe();
        };
    }, []);
    const showTraining = async (training) => {
        const trainingRef = doc(db, 'trainings', training.id);
        const trainingDoc = await getDoc(trainingRef);
        if (trainingDoc.exists()) {
            const trainingData = trainingDoc.data();
            setSelectedTraining(trainingData);
            handleOpen(); // Abrir el modal
        }
    };

    const closeTraining = () => {
        setSelectedTraining(null);
        handleClose()
    };
    const handleRealRepsChange = (e, supersetIndex, exerciseIndex) => {
        const updatedValue = e.target.value;

        // Actualiza el estado local con el nuevo valor de realReps
        setRealRepsValues((prevValues) => ({
            ...prevValues,
            [`${exerciseIndex}-${supersetIndex}`]: updatedValue,
        }));
    };
    // Agrega una función para actualizar realReps en Firebase
    const updateRealRepsInFirebase = async (supersetIndex, exerciseIndex) => {
        if (selectedTraining && selectedTraining.id) {
            // Asegúrate de que selectedTraining sea una copia actualizada
            const updatedTraining = { ...selectedTraining };
            const exercise = updatedTraining.exercises[exerciseIndex];

            // Actualiza el valor de realReps en el ejercicio
            exercise.superset[supersetIndex].realReps = realRepsValues[`${exerciseIndex}-${supersetIndex}`];

            // Actualiza el documento de entrenamiento en Firebase
            const trainingRef = doc(db, 'trainings', selectedTraining.id);
            await updateDoc(trainingRef, selectedTraining);

            // No es necesario actualizar el estado local aquí, Firebase debería reflejar los cambios en tiempo real
        }
    };
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        overflow: 'scroll', // Para permitir desplazamiento si el contenido es largo
    };

    console.log(routines)
    return (
        <div className={styles.myRoutine}>
            {routines
                .filter((routine) => routine.link === myUid)
                .map((routine, index) => (
                    <div key={routine.id} className={styles.routine}>
                        <div>
                            <div>
                                <p>
                                    <span>Rutina {index + 1}</span>
                                    <span>{routine.name}</span>
                                </p>
                                <p>
                                    <span>Descripción:</span>
                                    <span>{routine.description}</span>
                                </p>
                            </div>
                            <div>
                                <p>Entrenamientos</p>
                                <ul>
                                    {routine.trainings.map((training) => (
                                        <div key={training.id}>
                                            <span>Nombre Entrenamiento:</span>
                                            <span>{training.name}</span>
                                            <Button type="primary" onClick={() => showTraining(training)}>Ver Entrenamiento</Button>

                                        </div>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={style}>
                                {selectedTraining && (
                                    <Box>
                                        <Typography id="modal-modal-title" variant="h6" component="h2">
                                            Entrenamiento Seleccionado: {selectedTraining.name}
                                        </Typography>
                                        <Button onClick={closeTraining} style={{ marginBottom: '20px' }}>Cerrar Entrenamiento</Button>
                                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                            Descripción: {selectedTraining.description}
                                        </Typography>
                                        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
                                            Ejercicios:
                                        </Typography>
                                        {selectedTraining.exercises.map((exercise, exerciseIndex) => (
                                            <Box key={exerciseIndex} sx={{ mt: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {exerciseIndex + 1}. {exercise.name}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Descripción: {exercise.description}
                                                </Typography>
                                                {exercise.superset && exercise.superset.length > 0 && (
                                                    <Box>
                                                        <Typography sx={{ mt: 1 }}>Supersets:</Typography>
                                                        {exercise.superset.map((superset, supersetIndex) => (
                                                            <Box key={supersetIndex} display="flex" alignItems="center" sx={{ mt: 1 }}>
                                                                <Typography variant="body2" sx={{ width: '100px' }}>
                                                                    Repetitions: {superset.repetitions}
                                                                </Typography>
                                                                <input
                                                                    type="text"
                                                                    value={realRepsValues[`${exerciseIndex}-${supersetIndex}`] || ""}
                                                                    onChange={(e) => handleRealRepsChange(e, supersetIndex, exerciseIndex)}
                                                                    style={{ marginRight: '10px', width: '30px' }}
                                                                />
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => updateRealRepsInFirebase(supersetIndex, exerciseIndex)}
                                                                >
                                                                    Actualizar
                                                                </Button>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Modal>

                    </div>
                ))}
        </div>
    );
};

export default myroutines