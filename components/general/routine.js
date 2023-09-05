import {
  serverTimestamp,
  setDoc,
  doc,
  onSnapshot,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
  getDoc,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";

import { db } from "../../firebase.config";
import styles from "../../styles/routines.module.css";
import { getAuth } from "firebase/auth";
import AuthContext from "../../context/AuthContext";

import {
  FaRunning,
  FaCalendarDay,
  FaDumbbell,
  FaRegEdit,
  FaRegTrashAlt,
  FaPlus,
  FaCopy,
} from "react-icons/fa";

const routine = () => {
  const [data, setData] = useState([""]);
  const [exercises, setExercises] = useState([]);
  const [newexercise, setNewExercise] = useState({});
  const [trainings, setTrainings] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [visible, setVisible] = useState(false);
  const { myData, myUid } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routinesList, setRoutinesList] = useState(false);
  const [trainingsList, setTrainingsList] = useState(false);
  const [exercisesList, setExercisesList] = useState(false);
  const [selectExercises, setSelectExercises] = useState(false);
  const [selectedTrainings, setSelectedTrainings] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [newTrain, setNewTrain] = useState({
    name: "",
    description: "",
    exercises: [],
  });
  const [message, setMessage] = useState(false);
  const [updateExerciseId, setUpdateExerciseId] = useState(null);
  const [updateTrainingId, setUpdateTrainingId] = useState(null);
  const [copyTrainingId, setCopyTrainingId] = useState(null);
  const [trainingExercises, setTrainingExercises] = useState([]);
  const [addExercise, setAddExercise] = useState(false);
  const [currentTraining, setCurrentTraining] = useState([]);
  const [tExercise, setTExercise] = useState([]);
  const [showExerciseFields, setShowExerciseFields] = useState(false);
  const [isExerciseFromList, setIsExerciseFromList] = useState(false);
  const [current, setCurrent] = useState(false);
  const [addNewEx, setAddNewEx] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const [seriesData, setSeriesData] = useState([{ repetitions: "", sets: "" }]);
  const [myMessage, setMyMessage] = useState("");
  const [toggle, setToggle] = useState(false);

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

    const unsubTrainings = onSnapshot(
      collection(db, "trainings"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setTrainings(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
      unsubExercises();
      unsubTrainings();
    };
  }, []);
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

      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 3000);
    } catch (error) {
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
  const handleDeleteExercise = async (id) => {
    try {
      await deleteDoc(doc(db, "exercises", id));
      console.log("Document deleted");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  const handleAddExercise = () => {
    setCurrentTraining([...currentTraining, exerciseData]);
    setTExercise({
      name: "",
      repetitions: "",
      sets: "",
    });
  };
  const handleRemoveExercise = (index) => {
    const newTraining = [...currentTraining];
    newTraining.splice(index, 1);
    setCurrentTraining(newTraining);
  };
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

  // Para crear entrenamientos

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
      setMyMessage("creado");
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };
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

  const asignRoutine = (id) => {
    setShowClient(true);
    setCurrentRoutine(id);
  };
  const selectTrainer = async (cr, id) => {
    console.log("id", id);
    console.log("MyUid", myUid);
    await updateDoc(doc(db, "routines", cr), {
      link: id,
    });
    setShowClient(false);
  };
  const handleView = (id) => {
    setVisible(true);
    setRoutineId(id); // Guarde el ID de la rutina seleccionada en el estado
  };
  //Create Routine

  const handleCreateRoutine = async (e) => {
    e.preventDefault();

    const routineData = {
      name: data.nameroutine,
      description: data.desroutine,
    };
    try {
      await addDoc(collection(db, "routines"), {
        ...routineData,

        timeStamp: serverTimestamp(),
      });
      setMyMessage("creado");
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  //Modales

  const handleCloseExerciseModal = () => {
    setShowExerciseModal(false);
    // Restablece cualquier estado relacionado con el modal de ejercicio aquí
  };

  const handleCloseTrainingModal = () => {
    setShowTrainingModal(false);
    setCurrent(false);
    // setTrainingData('');
    // Restablece cualquier estado relacionado con el modal de entrenamiento aquí
  };

  const handleAddExerciseToTraining = (exerciseId, checked) => {
    if (checked) {
      setTrainingData((prevData) => ({
        ...prevData,
        exercises: [...prevData.exercises, exerciseId],
      }));
    } else {
      setTrainingData((prevData) => ({
        ...prevData,
        exercises: prevData.exercises.filter((id) => id !== exerciseId),
      }));
    }
  };

  const handleCloseRoutineModal = () => {
    setShowRoutineModal(false);
    // Restablece cualquier estado relacionado con el modal de rutina aquí
  };

  const handleAddTrainingToRoutine = (trainingId) => {
    setSelectedDays((prevSelectedDays) => {
      const updatedDays = { ...prevSelectedDays };
      for (const day of Object.keys(updatedDays)) {
        if (updatedDays[day] === trainingId) {
          updatedDays[day] = null;
        }
      }
      if (!updatedDays[selectedDays[0]]) {
        updatedDays[selectedDays[0]] = trainingId;
      }
      return updatedDays;
    });
  };

  const handleSelectDay = (day) => {
    setSelectedDays((prevSelectedDays) => {
      if (!Array.isArray(prevSelectedDays)) {
        prevSelectedDays = []; // Si no es un array, inicialízalo como un array vacío.
      }
      return prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((selectedDay) => selectedDay !== day)
        : [...prevSelectedDays, day];
    });
  };

  const viewRoutinesList = () => {
    setRoutinesList(true);
    setTrainingsList(false);
    setExercisesList(false);
  };
  const viewTrainingList = () => {
    setRoutinesList(false);
    setTrainingsList(true);
    setExercisesList(false);
  };
  const viewExercisesList = () => {
    setRoutinesList(false);
    setTrainingsList(false);
    setExercisesList(true);
  };

  const handleSelectExercise = (exercise) => {
    setIsExerciseFromList(true);
    setShowExerciseFields(true);
    setTExercise({
      name: exercise.exercise_name,
      repetitions: "",
      sets: "",
    });
  };

  const handleAddExerciseClick = (e) => {
    e.preventDefault();
    setCurrentTraining([...currentTraining, tExercise]);
    setAddNewEx(false);
    setSelectExercises(false);
    setTExercise([]);
  };

  const handleAddSeries = () => {
    setSeriesData([...seriesData, { repetitions: "", sets: "" }]);
  };
  const handleInputChange = (index, event) => {
    const values = [...seriesData];
    if (event.target.name === "repetitions") {
      values[index].repetitions = event.target.value;
    } else {
      values[index].sets = event.target.value;
    }
    setSeriesData(values);
  };

  return (
    <div className={styles.routinesContainer}>
      <div className={styles.editor}>
        {!routinesList && !trainingsList && !exercisesList && (
          <div className={styles.top}>
            <div
              onClick={() => setShowRoutineModal(true)}
              className={styles.routine}
            >
              <FaCalendarDay size={50} />
              <p>Crear Rutina</p>
            </div>
            <div
              onClick={() => {
                setShowTrainingModal(true);
                setCurrent(true);
              }}
              className={styles.routine}
            >
              <FaRunning size={50} />
              <p>Crear Entrenamiento</p>
            </div>
            <div
              onClick={() => setShowExerciseModal(true)}
              className={styles.routine}
            >
              <FaDumbbell size={50} />
              <p>Crear Ejercicio</p>
            </div>
            <div className={styles.selectmenu}>
              <div onClick={viewRoutinesList}>Ver Mis Rutinas</div>
              <div onClick={viewTrainingList}>Ver Mis Entrenamientos</div>
              <div onClick={viewExercisesList}>Ver Mis Ejercicios</div>
            </div>
          </div>
        )}
        {(routinesList || trainingsList || exercisesList) && (
          <div className={styles.bottom}>
            <div className={styles.myddbb}>
              {routinesList && (
                <div className={styles.myddbbitem}>
                  <h3>Mis Rutinas</h3>
                  {routines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={(e) => handleAssignTraining(e, routine.id)}
                    >
                      Asignar Rutina
                    </button>
                  ))}
                </div>
              )}
              {trainingsList && (
                <div className={styles.myddbbitem}>
                  <h3>Mis entrenamientos</h3>
                  <table>
                    <tr>
                      <th>Nombre del Entrenamiento</th>
                      <th>Descripción</th>
                      <th>Ejercicios</th>
                      <th>Opciones</th>
                    </tr>
                    {trainings.map((training) => (
                      <tr key={training.id}>
                        <td>{training.name}</td>
                        <td>{training.description}</td>
                        <td>
                          {training.exercises.map((exercise) => (
                            <div key={exercise.id}>
                              <p>{exercise.name}</p>
                            </div>
                          ))}
                        </td>
                        <td>
                          <FaRegEdit
                            size={20}
                            onClick={() => {
                              setUpdateTrainingId(training.id);
                              setShowTrainingModal(true);
                              setCurrent(true);
                            }}
                          />
                          <FaCopy
                            size={20}
                            onClick={() => {
                              setCopyTrainingId(training.id);
                              setShowTrainingModal(true);
                            }}
                          />
                          <FaRegTrashAlt
                            size={20}
                            onClick={() => handleDeleteTraining(training.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </table>
                </div>
              )}
              {exercisesList && (
                <div className={styles.myddbbitem}>
                  <h3>Mis ejercicios</h3>
                  <table>
                    <tr>
                      <th>Nombre</th>
                      <th>Equipamiento</th>
                      <th>Comentarios</th>
                      <th>Opciones</th>
                    </tr>
                    <div className={styles.exercise}>
                      {exercises.map((exercise) => (
                        <tr key={exercise}>
                          <td>{exercise.name}</td>
                          <td>{exercise.material}</td>
                          <td>{exercise.comments}</td>
                          <td>
                            <FaRegEdit
                              size={20}
                              onClick={() => {
                                setUpdateExerciseId(exercise.id);
                                setShowExerciseModal(true);
                              }}
                            />
                            <FaRegTrashAlt
                              size={20}
                              onClick={() => handleDeleteExercise(exercise.id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </div>
                  </table>
                </div>
              )}
            </div>
            <div
              className={styles.closebutton}
              onClick={() => {
                setRoutinesList(false);
                setTrainingsList(false);
                setExercisesList(false);
              }}
            >
              X
            </div>
          </div>
        )}
      </div>
      {showExerciseModal && (
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
            {message && (
              <div className={styles.message}>Ejercicio creado con éxito</div>
            )}
          </div>
        </div>
      )}
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
                  onChange={(e) => {
                    setNewTrain({ ...newTrain, name: e.target.value });
                  }}
                />
              </div>
              <div>
                <p>Descripción:</p>
                <textarea
                  type="text"
                  value={newTrain.description}
                  onChange={(e) =>
                    setNewTrain({
                      ...newTrain,
                      description: e.target.value,
                    })
                  }
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
                        <p>Repeticiones: </p>
                        <p>{exercise.repetitions}</p>
                      </div>
                      <div>
                        <p>Series: </p>
                        <p>{exercise.sets}</p>
                      </div>
                      <div>
                        <p>Materiales: </p>
                        <p>{exercise.materials}</p>
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
              </div>
            )}
            <div className={styles.trainingButton}>
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
              <button
                className={styles.create}
                onClick={() => setToggle(!toggle)}
              >
                Ver Actual
              </button>
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
        <>
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
              <div>
                <p>Repeticiones:</p>
                <input
                  type="text"
                  name="repetitions"
                  value={tExercise.repetitions}
                  onChange={(e) =>
                    setTExercise({ ...tExercise, repetitions: e.target.value })
                  }
                />
              </div>
              <div>
                <p>Series:</p>
                <input
                  type="text"
                  name="sets"
                  value={tExercise.sets}
                  onChange={(e) =>
                    setTExercise({ ...tExercise, sets: e.target.value })
                  }
                />
              </div>
              <button className={styles.add}>+</button>
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
                value={tExercise.materials}
                onChange={(e) =>
                  setTExercise({ ...tExercise, materials: e.target.value })
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
        </>
      )}
      {selectExercises && (
        <form className={styles.secondWidth}>
          <h3>Mis ejercicios</h3>
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
            X
          </span>
        </form>
      )}
      {showRoutineModal && (
        <div className={styles.modal}>
          <div>
            <form onSubmit={handleCreateRoutine}>
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
                <input
                  type="text"
                  value={data.desroutine}
                  onChange={(e) => {
                    setData({ ...data, desroutine: e.target.value });
                    console.log(data);
                  }}
                />
              </div>
              <h3>Entrenamientos</h3>
              {trainings.map((training) => (
                <div key={training.id}>
                  <input
                    type="checkbox"
                    id={training.id}
                    value={training.id}
                    onChange={(e) => handleAddTrainingToRoutine(e.target.value)}
                  />
                  <label htmlFor={training.id}>{training.name}</label>
                </div>
              ))}
              <h3>Días</h3>
              <div className={styles.myweek}>
                {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                  <div key={day} className={styles.myday}>
                    <input
                      type="checkbox"
                      id={day}
                      value={day}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                    <label htmlFor={day}>{day}</label>
                  </div>
                ))}
              </div>
              <div className={styles.create} onClick={handleCreateRoutine}>
                Crear Rutina
              </div>
            </form>
            <div
              className={styles.closebutton}
              onClick={handleCloseRoutineModal}
            >
              X
            </div>
          </div>
        </div>
      )}
      {showClient && (
        <div className={styles.share}>
          {myData
            .filter((data) => data.role === "client")
            .map((data) => (
              <div
                key={data.id}
                onClick={() => selectTrainer(currentRoutine, data.id)}
              >
                <div>
                  {data.img ? (
                    <img src={data.img} alt={"myprofileimg"} />
                  ) : (
                    <img src="/face.jpg" alt={"myprofileimg"} />
                  )}
                </div>
                <p>{data.username}</p>
              </div>
            ))}
          <button onClick={() => setShowClient(false)}>Cerrar</button>
        </div>
      )}
    </div>
  );
};

export default routine;
