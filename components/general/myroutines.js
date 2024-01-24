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
            {
                showRoutineModal && (
                    <div className={styles.modal}
                    >
                        <div className={styles.exContent} styles={{ display: showTrainingModal ? 'none' : '' }}>
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
                                            <p>Define tu rutina</p>
                                            <p>
                                                <FaCalendarDay size={50} />
                                            </p>
                                        </div>
                                        <div>
                                            <IoIosArrowForward size={50} onClick={() => { next(step) }} />
                                        </div>
                                    </div>}
                                {step === 'two' && (
                                    <div style={step === 'two' ? {
                                        backgroundColor: '#f69d21', color: '#000000',
                                        borderColor: '#000000'
                                    } : { backgroundColor: '#000000' }}>
                                        <div>

                                            <IoIosArrowForward size={50} style={{ rotate: '180deg' }} onClick={() => prev(step)} />
                                        </div>
                                        <div>
                                            <p>¿Quieres crear algún entrenamiento nuevo?</p>
                                            <FaCalendarDay size={50} />
                                        </div>
                                        <div>
                                            <IoIosArrowForward size={50} onClick={() => next(step)} />
                                        </div>

                                    </div>
                                )}
                                {step === 'three' && (
                                    <div style={step === 'three' ? {
                                        backgroundColor: '#f69d21', color: '#000000',
                                        borderColor: '#000000'
                                    } : { backgroundColor: '#000000' }}>
                                        <div>
                                            <IoIosArrowForward size={50} style={{ rotate: '180deg' }} onClick={() => prev(step)} />
                                        </div>
                                        <div>
                                            <p>Asigna entrenamientos a los días</p>
                                            <FaRunning size={50} />
                                        </div>
                                        <div>
                                            <IoIosArrowForward size={50} onClick={() => next(step)} />
                                        </div>

                                    </div>
                                )}
                                {step === 'four' && <div
                                    style={step === 'four' ? {
                                        backgroundColor: '#f69d21', color: '#000000',
                                        borderColor: '#000000'
                                    } : { backgroundColor: '#000000' }}>
                                    <div>
                                        <IoIosArrowForward size={50} style={step === 'one' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => prev(step)} />
                                    </div>
                                    <div>
                                        <p>Revisa y envía tu rutina</p>
                                        <p>
                                            <FaRunning size={50} />
                                        </p>
                                    </div>
                                    <div>
                                        <IoIosArrowForward size={50} style={step === 'four' ? { color: 'transparent' } : { rotate: '180deg' }} onClick={() => { next(step) }} />
                                    </div>

                                </div>}
                            </div>
                            <form onSubmit={handleCreateRoutine}>
                                {step === 'one' &&
                                    <>
                                        <div>
                                            <p>Nombre:</p>
                                            <input
                                                type="text"
                                                value={data.nameroutine}
                                                onChange={(e) => {
                                                    setData({ ...data, nameroutine: e.target.value });
                                                    console.log(data);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p>Descripción:</p>
                                            <textarea
                                                type="text"
                                                value={data.desroutine}
                                                onChange={(e) => {
                                                    setData({ ...data, desroutine: e.target.value });
                                                    console.log(data);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p>Selecciona los días que entrenarás a la semana</p>
                                            <select value={numDays} onChange={handleNumDaysChange}>
                                                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                                    <option key={n} value={n}>{n}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            {routineData.days.map((day, index) => (
                                                <div key={index}>
                                                    <p>{day}</p>

                                                </div>
                                            ))}
                                        </div>
                                    </>}
                                {step === 'two' &&
                                    <>
                                        <h1>Crea tus entrenamientos</h1>
                                        <button onClick={() => {
                                            setShowTrainingModal(true);
                                            setShowRoutineModal(false);
                                            setCurrent(true);
                                        }} >Crea nuevo entrenamiento</button>

                                    </>}
                                {step === 'three' && <>  <h2>Añade Tus Entrenamientos</h2>
                                    <h3>Selecciona desde tu Banco de ejercicios</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {routineData.days && routineData.days.map((day, index) => (
                                            <div key={index} >
                                                <p>{day}</p>
                                                <select onChange={(e) => handleTrainingAssignment(e, day)}>
                                                    <option value="">Selecciona un entrenamiento</option>
                                                    {trainings.map((training) => (
                                                        <option key={training.id} value={training.id}>
                                                            {training.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div></>}

                                {step === 'four' && (
                                    <>
                                        <button className={styles.create} onClick={handleCreateRoutine}>
                                            Crear Rutina
                                        </button>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <h3>Resumen de la Rutina</h3>
                                            <p>Nombre de la Rutina: {data.nameroutine}</p>
                                            <p>Descripción: {data.desroutine}</p>
                                            <p>Días de Entrenamiento: {data.days}</p>
                                            <h4>Entrenamientos Asignados:</h4>
                                            {routineData.days.map((day) => (
                                                <div key={day}>
                                                    <h5>{day}</h5>
                                                    {Array.isArray(routineData.dayTrainings[day]) && routineData.dayTrainings[day].map((trainingId) => {
                                                        const training = trainings.find(t => t.id === trainingId);
                                                        return (
                                                            training ? (
                                                                <div key={training.id} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                                                    <h3>{training.name}</h3>
                                                                    <p>{training.description}</p>
                                                                    <h4>Ejercicios:</h4>
                                                                    {training.exercises.map((exercise, index) => (
                                                                        <div key={index} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                                                            <p>Nombre del ejercicio: {exercise.name}</p>
                                                                            <p>Comentarios: {exercise.comments}</p>
                                                                            <p>Material: {exercise.material}</p>
                                                                            {exercise.superset && (
                                                                                <>
                                                                                    <h5>Supersets:</h5>
                                                                                    {exercise.superset.map((superset, supersetIndex) => (
                                                                                        <div key={supersetIndex}>
                                                                                            <p>Repeticiones: {superset.repetitions}</p>
                                                                                            <p>Sets: {superset.sets}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : null
                                                        );
                                                    })}
                                                </div>
                                            ))}


                                        </div>
                                    </>
                                )}

                            </form>

                        </div>
                        <div className={styles.closebutton} onClick={handleCloseRoutineModal}>
                            X
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default myroutines