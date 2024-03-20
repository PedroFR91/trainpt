import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../firebase.config';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import { BsFillShareFill } from 'react-icons/bs';

const myroutines = () => {
    const [routines, setRoutines] = useState([])
    const [updateRoutineId, setUpdateRoutineId] = useState(null)
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "routines"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setRoutines(list);
            },
            (error) => {
                console.log(error);
            }
        );


        return () => {
            unsub();

        };
    }, []);
    return (
        <div>
            {routines.map((routine) => (
                <div key={routine.id} style={{
                    border: '1px solid #ffffff', borderRadius: '8px', padding: '1rem', display: 'flex',
                    flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><p>Nombre de la Rutina</p><p>{routine.name}</p></div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><p>Descripción</p><p style={{ width: '200px' }}>{routine.description}</p></div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <p>Entrenamientos</p>
                        {routine.trainings.map((training, index) => (
                            <div key={index}>
                                <p>{training.name}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: '100px', display: 'flex', justifyContent: 'space-between' }}>
                        <FaRegEdit size={20}
                            onClick={() => {
                                setUpdateRoutineId(routine.id);
                                setShowRoutineModal(true);
                            }} />
                        <BsFillShareFill
                            size={20}
                            onClick={() => {
                                setShowClient(true);
                                setCurrentRoutine(routine.id);
                            }}
                        />
                        <FaRegTrashAlt size={20} onClick={() => { handleDeleteRoutine(routine.id) }} />

                    </div>
                </div>
            ))}

        </div>
    )
}

export default myroutines