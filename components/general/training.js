import React from 'react';
import { FaRunning, FaDumbbell, FaPlus } from 'react-icons/fa';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import styles from "../../styles/routines.module.css";
const Training = ({
    showTrainingModal,
    newTrain,
    toggle,
    currentTraining,
    isExerciseFromList,
    tExercise,
    setTExercise,
    handleAddExerciseClick,
    setAddNewEx,
    addNewEx,
    setSelectExercises,
    exercises,
    handleRemoveExercise,
    handleCloseTrainingModal,
    updateTrainingId,
    handleUpdateTraining,
    handleCreateTraining,
    myMessage,
    message,
}) => {
    return (
        <div>
            {showTrainingModal && (
                <div className={styles.modal}>
                    <div className={styles.exContent}>
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
                        {toggle && (
                            <div className={styles.myCurrent}>
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
                                                    {exercise && exercise.exercises && exercise.exercises.map((exercise, index) => (
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
                                <div
                                    className={styles.backbutton}
                                    onClick={() => setToggle(false)}
                                >
                                    <AiOutlineArrowLeft />
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
                        <div className={styles.trainingButton}>
                            <div>
                                <button
                                    className={styles.create}
                                    onClick={() => {
                                        setAddNewEx(true);
                                        setSelectExercises(false);
                                    }}
                                >
                                    Nuevo ejercicio
                                </button>
                                <button
                                    className={styles.create}
                                    onClick={() => {
                                        setSelectExercises(true);
                                        setAddNewEx(false);
                                    }}
                                >
                                    Añadir desde BBDD
                                </button>
                            </div>
                            {!toggle && (
                                <button
                                    className={styles.create}
                                    onClick={() => setToggle(true)}
                                >
                                    Ver Actual
                                </button>
                            )}
                        </div>
                        <div
                            className={styles.closebutton}
                            onClick={handleCloseTrainingModal}
                        >
                            X
                        </div>
                        {message && (
                            <div className={styles.message}>
                                Entrenamiento {myMessage} con éxito
                            </div>
                        )}
                    </div>
                </div>
            )}
            {addNewEx && (
                <form className={styles.secondWidth}>
                    <FaDumbbell size={50} />
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
                    <span
                        className={styles.closebutton}
                        onClick={() => {
                            setAddNewEx(false);
                        }}
                    >
                        X
                    </span>
                </form>
            )}
            {selectExercises && (
                <form className={styles.secondWidth}>
                    <h3>Banco de Ejercicios</h3>
                    <table>
                        <tr>
                            <th>Nombre</th>
                            <th>Equipamiento</th>
                            <th>Comentarios</th>
                            <th>Opciones</th>
                        </tr>
                        {exercises.map((exercise) => (
                            <tr key={exercise} className={styles.exercise}>
                                <td>{exercise.name}</td>
                                <td>{exercise.material}</td>
                                <td>{exercise.comments}</td>
                                <td>
                                    <FaPlus
                                        size={20}
                                        onClick={(e) => {
                                            setSelectExercises(false);
                                            setTExercise({
                                                ...exercise,
                                                name: exercise.name,
                                                repetitions: "",
                                                sets: "",
                                            });
                                            setAddNewEx(true);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </table>
                    <span
                        className={styles.closebuttontwo}
                        onClick={() => {
                            setSelectExercises(false);
                        }}
                    >
                    </span>
                </form>
            )}
        </div>
    );
};

export default Training;
