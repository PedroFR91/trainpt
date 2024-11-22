// components/client/myroutines.js

import React, { useEffect, useState, useContext } from 'react';
import { Collapse, Carousel, Card, Spin, message } from 'antd';
import { db } from '../../firebase.config';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/routines.module.css';

const { Panel } = Collapse;

const MyRoutines = () => {
    const { myUid } = useContext(AuthContext);
    const [assignedRoutines, setAssignedRoutines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!myUid) return;
        const assignedRoutinesRef = collection(db, `clients/${myUid}/assignedRoutines`);

        const unsubscribe = onSnapshot(assignedRoutinesRef, async (snapshot) => {
            const routinesData = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const assignedRoutine = docSnap.data();

                    // Agregar logs para depuración
                    console.log('assignedRoutine:', assignedRoutine);

                    const trainerId = assignedRoutine.trainerId;
                    const routineId = assignedRoutine.routineId;

                    console.log('trainerId:', trainerId);
                    console.log('routineId:', routineId);

                    // Verificar si trainerId y routineId están definidos
                    if (!trainerId || !routineId) {
                        message.error('Datos incompletos en la rutina asignada');
                        return null;
                    }

                    // Obtener detalles de la rutina desde el entrenador
                    const routineRef = doc(db, `trainers/${trainerId}/routines`, routineId);
                    const routineSnap = await getDoc(routineRef);
                    if (routineSnap.exists()) {
                        const routineData = routineSnap.data();
                        return {
                            id: docSnap.id,
                            ...assignedRoutine,
                            routineData,
                        };
                    } else {
                        message.error('No se pudo obtener la rutina asignada');
                        return null;
                    }
                })
            );
            // Filtrar las rutinas que son null
            setAssignedRoutines(routinesData.filter((routine) => routine !== null));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [myUid]);


    if (loading) {
        return <Spin size="large" />;
    }

    if (assignedRoutines.length === 0) {
        return <p>No tienes rutinas asignadas.</p>;
    }

    return (
        <div className={styles.myRoutines}>
            {assignedRoutines.map((assignedRoutine) => (
                <Card key={assignedRoutine.id} title={assignedRoutine.routineData.name}>
                    <p>{assignedRoutine.routineData.description}</p>
                    <Collapse accordion>
                        {Object.entries(assignedRoutine.routineData.days).map(([day, dayData]) => (
                            <Panel header={day} key={day}>
                                <TrainingCarousel
                                    trainerId={assignedRoutine.trainerId}
                                    trainingId={dayData.trainingId}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                </Card>
            ))}
        </div>
    );
};

const TrainingCarousel = ({ trainerId, trainingId }) => {
    const [trainingData, setTrainingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrainingData = async () => {
            const trainingRef = doc(db, `trainers/${trainerId}/trainings`, trainingId);
            const trainingSnap = await getDoc(trainingRef);
            if (trainingSnap.exists()) {
                setTrainingData(trainingSnap.data());
            } else {
                message.error('No se pudo obtener el entrenamiento asignado');
            }
            setLoading(false);
        };
        fetchTrainingData();
    }, [trainerId, trainingId]);

    if (loading) {
        return <Spin size="large" />;
    }

    if (!trainingData) {
        return <p>No se pudo cargar el entrenamiento.</p>;
    }

    // Verificar que trainingData.exercises es un arreglo
    if (!Array.isArray(trainingData.exercises) || trainingData.exercises.length === 0) {
        return <p>No hay ejercicios disponibles.</p>;
    }

    return (
        <div>
            <h3>{trainingData.name}</h3>
            <p>{trainingData.description}</p>
            <Carousel dots={false}>
                {trainingData.exercises.map((exercise, index) => {
                    console.log('Exercise:', exercise);
                    const exerciseId = exercise.exerciseId || exercise.id; // Use 'id' if 'exerciseId' is not present
                    if (!exerciseId) {
                        console.error('Exercise ID is missing for exercise:', exercise);
                        return null; // Skip this exercise
                    }
                    return (
                        <ExerciseCard
                            key={index}
                            trainerId={trainerId}
                            exerciseId={exerciseId}
                            exerciseData={exercise}
                        />
                    );
                })}

            </Carousel>
        </div>
    );
};

const ExerciseCard = ({ trainerId, exerciseId, exerciseData }) => {
    const [exerciseDetails, setExerciseDetails] = useState(null);

    useEffect(() => {
        const fetchExerciseDetails = async () => {
            const exerciseRef = doc(db, `trainers/${trainerId}/exercises`, exerciseId);
            const exerciseSnap = await getDoc(exerciseRef);
            if (exerciseSnap.exists()) {
                setExerciseDetails(exerciseSnap.data());
            } else {
                message.error('No se pudo obtener los detalles del ejercicio');
            }
        };
        fetchExerciseDetails();
    }, [trainerId, exerciseId]);

    if (!exerciseDetails) {
        return <Spin size="large" />;
    }

    return (
        <Card title={exerciseDetails.name}>
            <p>{exerciseDetails.description}</p>
            <p>
                Series: {exerciseData.sets} - Repeticiones: {exerciseData.reps} - Descanso: {exerciseData.rest} seg
            </p>
            {/* Aquí puedes agregar más detalles o elementos multimedia del ejercicio */}
        </Card>
    );
};

export default MyRoutines;
