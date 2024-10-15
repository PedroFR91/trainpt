import React, { useEffect, useState } from 'react';
import { Collapse, message } from 'antd';
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase.config";

const { Panel } = Collapse;

const RoutineDetails = ({ assignedRoutineId }) => {
    const [routine, setRoutine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trainings, setTrainings] = useState({});

    useEffect(() => {
        const fetchRoutineDetails = async () => {
            try {
                // Obtener los detalles de la rutina
                const routineDoc = await getDoc(doc(db, "routines", assignedRoutineId));
                if (routineDoc.exists()) {
                    const routineData = routineDoc.data();
                    setRoutine(routineData);

                    // Consultar los entrenamientos basados en los IDs en 'days'
                    const trainingPromises = Object.values(routineData.days).map(async (day) => {
                        const trainingDoc = await getDoc(doc(db, "trainings", day.trainingId));
                        if (trainingDoc.exists()) {
                            return { id: day.trainingId, ...trainingDoc.data() };
                        }
                        return null;
                    });

                    const trainingResults = await Promise.all(trainingPromises);

                    // Formatear los entrenamientos para un acceso rápido por ID
                    const trainingMap = trainingResults.reduce((map, training) => {
                        if (training) map[training.id] = training;
                        return map;
                    }, {});

                    setTrainings(trainingMap);
                } else {
                    message.error("Rutina no encontrada.");
                }
            } catch (error) {
                console.error("Error al obtener la rutina:", error);
                message.error("Error al obtener la rutina.");
            } finally {
                setLoading(false);
            }
        };

        if (assignedRoutineId) {
            fetchRoutineDetails();
        }
    }, [assignedRoutineId]);

    if (loading) {
        return <p>Cargando detalles de la rutina...</p>;
    }

    if (!routine) {
        return <p>No se encontró la rutina.</p>;
    }

    // Renderiza los ejercicios dentro de un panel anidado
    const renderExercises = (exercises) => {
        return exercises.map(exercise => (
            <Panel header={exercise.name} key={exercise.id}>
                <p><strong>Material:</strong> {exercise.material}</p>
                <p><strong>Comentarios:</strong> {exercise.comments}</p>
            </Panel>
        ));
    };

    // Renderiza los entrenamientos de un día
    const renderTrainings = () => {
        return Object.keys(routine.days).map((day) => {
            const trainingId = routine.days[day]?.trainingId;
            const training = trainings[trainingId];

            if (!training) return null;

            return (
                <Panel header={day} key={day}>
                    <Collapse>
                        {renderExercises(training.exercises)}
                    </Collapse>
                </Panel>
            );
        });
    };

    return (
        <div>
            <h2>{routine.name}</h2>
            <p>{routine.description}</p>
            <Collapse>
                {renderTrainings()}
            </Collapse>
        </div>
    );
};

export default RoutineDetails;
