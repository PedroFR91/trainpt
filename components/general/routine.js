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
  query,
} from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import Exercise from "./exercise";
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
  FaCalendar,
  FaDatabase,
} from "react-icons/fa";
import Training from "./training";
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
  const [message, setMessage] = useState(false);
  const [updateExerciseId, setUpdateExerciseId] = useState(null);
  const [updateTrainingId, setUpdateTrainingId] = useState(null);
  const [updateRoutineId, setUpdateRoutineId] = useState(null)
  const [copyTrainingId, setCopyTrainingId] = useState(null);
  const [trainingExercises, setTrainingExercises] = useState([]);
  const [addExercise, setAddExercise] = useState(false);

  const [tExercise, setTExercise] = useState([]);
  const [showExerciseFields, setShowExerciseFields] = useState(false);
  const [isExerciseFromList, setIsExerciseFromList] = useState(false);
  const [current, setCurrent] = useState(false);
  const [addNewEx, setAddNewEx] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const [seriesData, setSeriesData] = useState([{ repetitions: "", sets: "" }]);
  const [myMessage, setMyMessage] = useState("");

  const [clients, setClients] = useState([]);
  const [step, setStep] = useState('one')

  useEffect(() => {
    if (myData) {
      // Realizar la consulta para obtener todos los usuarios
      const q = query(collection(db, "users"));
      const unsub = onSnapshot(q, (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Actualizar el estado con todos los usuarios
        setClients(list);
      });

      return () => {
        unsub();
      };
    }
  }, [myData]);

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
  const handleDeleteTraining = async (id) => {
    try {
      await deleteDoc(doc(db, "trainings", id));
      console.log("Document deleted");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const selectTrainer = async (cr, id) => {
    await updateDoc(doc(db, "routines", cr), {
      link: id,
    });
    setShowClient(false);
  };
  //Create Routine
  const handleCreateRoutine = async (e) => {
    e.preventDefault();

    const selectedTrainings = data.trainings || [];

    // Obtener una lista de objetos con los IDs y nombres de los entrenamientos seleccionados
    const selectedTrainingsData = selectedTrainings.map((training) => ({
      id: training.id,
      name: training.name,
    }));

    const routineData = {
      name: data.nameroutine,
      description: data.desroutine,
      trainings: selectedTrainingsData || [], // Guardar los IDs y nombres de los entrenamientos seleccionados
      days: data.days || '', // Agregar los días de entrenamiento
    };

    try {
      await addDoc(collection(db, "routines"), {
        ...routineData,
        timeStamp: serverTimestamp(),
      });
      setMyMessage("creada");
      setData({
        name: "",
        description: "",
        trainings: [],
        days: ""
      })
      setMessage(true);
      setTimeout(() => {
        setMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await deleteDoc(doc(db, "routines", id));
      console.log("Routine deleted");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  const handleUpdateRoutine = async (e, id, routineData) => {
    e.preventDefault();
    try {
      const routineData = {
        nameroutine: routineData.nameroutine,
        desroutine: routineData.desroutine,
        trainings: routineData.trainings,
        days: routineData.days,
        // Agrega otros campos que necesites actualizar
      };

      const docRef = doc(db, "routines", id);
      await updateDoc(docRef, routineData);

      console.log("Rutina actualizada");
      setMyMessage("actualizada");
      setMessage(true);

      // Limpia los campos del formulario o realiza otras acciones necesarias

      setTimeout(() => {
        setMessage(false);
        // Cierra el modal u otras acciones después de actualizar
      }, 3000);
    } catch (error) {
      console.error("Error al actualizar la rutina: ", error);
    }
  };

  //Modales

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
    console.log(tExercise)
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
                  <table>
                    <tr>
                      <th>Nombre de la Rutina</th>
                      <th>Descripción</th>
                      <th>Entrenamientos</th>
                      <th>Opciones</th>
                    </tr>
                    {routines.map((routine) => (
                      <tr key={routine.id}>
                        <td>{routine.name}</td>
                        <td>{routine.description}</td>
                        <td>
                          {routine.trainings.map((training, index) => (
                            <div key={index}>
                              <p>{training.name}</p>
                            </div>
                          ))}
                        </td>
                        <td>
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

                        </td>
                      </tr>
                    ))}
                  </table>
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
        <Exercise
          showExerciseModal={showExerciseModal} setShowExerciseModal={setShowExerciseModal}
        />
      )}
      {showTrainingModal && <Training showTrainingModal={showTrainingModal} setShowTrainingModal={setShowTrainingModal} />}
      {showRoutineModal && (
        <div className={styles.modal}
        >
          <div className={styles.exContent} styles={{ display: showTrainingModal ? 'none' : '' }}>
            <div className={styles.trainsteps}>
              <div onClick={() => { setStep('one') }}
                style={step === 'one' ? {
                  backgroundColor: '#f69d21', color: '#000000',
                  borderColor: '#000000'
                } : { backgroundColor: '#000000' }}>
                <p>Define tu rutina</p>
                <p>
                  <FaCalendarDay size={50} />
                </p>
              </div>
              <div onClick={() => { setStep('two') }}
                style={step === 'two' ? {
                  backgroundColor: '#f69d21', color: '#000000',
                  borderColor: '#000000'
                } : { backgroundColor: '#000000' }}>
                <p>Crea un entrenamiento</p>
                <p>
                  <FaRunning size={50} />
                </p>
              </div>
              <div onClick={() => { setStep('three') }}
                style={step === 'three' ? {
                  backgroundColor: '#f69d21', color: '#000000',
                  borderColor: '#000000'
                } : { backgroundColor: '#000000' }}>
                <p>Añade entrenamientos existentes</p>
                <p>
                  <FaDatabase size={50} />
                </p>
              </div>
              <div onClick={() => { setStep('four') }}
                style={step === 'four' ? {
                  backgroundColor: '#f69d21', color: '#000000',
                  borderColor: '#000000'
                } : { backgroundColor: '#000000' }}>
                <p>Organiza tu rutina</p>
                <p>
                  <FaCalendar size={50} />
                </p>
              </div>
              <div onClick={() => { setStep('five') }}
                style={step === 'five' ? {
                  backgroundColor: '#f69d21', color: '#000000',
                  borderColor: '#000000'
                } : { backgroundColor: '#000000' }}>
                <p>Envía entrenamiento</p>
                <p>
                  <FaRunning size={50} />
                </p>
              </div>
            </div>
            <form onSubmit={handleCreateRoutine}>

              {step === 'one' &&
                <>
                  <FaCalendarDay size={50} />
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
                </>}
              {step === 'two' &&
                <> <h3 onClick={() => {
                  setShowTrainingModal(true);
                  setShowRoutineModal(false);
                  setCurrent(true);
                }} >Crea tus nuevos entrenamientos</h3>
                </>}
              {step === 'three' && <>  <h2>Añade Tus Entrenamientos</h2>
                <h3>Selecciona desde tu Banco de ejercicios</h3>
                <div className={styles.addtrainings}>

                  {trainings.map((training) => (
                    <div key={training.id} className={styles.trainingCheckbox}>
                      <input
                        type="checkbox"
                        id={training.id}
                        value={training.id}
                        onChange={(e) => {
                          // Verificar si el entrenamiento está seleccionado
                          const selectedTrainings = data.trainings || [];
                          if (e.target.checked) {
                            // Agregarlo a la lista si está marcado
                            selectedTrainings.push({
                              id: training.id,
                              name: training.name,
                            });
                          } else {
                            // Quitarlo de la lista si está desmarcado
                            const index = selectedTrainings.findIndex(
                              (item) => item.id === training.id
                            );
                            if (index !== -1) {
                              selectedTrainings.splice(index, 1);
                            }
                          }
                          setData({ ...data, trainings: selectedTrainings });
                        }}
                      />
                      <label htmlFor={training.id}>{training.name}</label>
                    </div>
                  ))}
                </div></>}
              {step === 'four' && <> <h3>Días de entrenamiento</h3>
                <div className={styles.myday}>
                  <input
                    type="text"
                    value={data.days || ''}
                    onChange={(e) => setData({ ...data, days: e.target.value })}
                  />
                </div>
              </>}

              {step === 'five' && <>  <button className={styles.create} onClick={handleCreateRoutine}>
                Crear Rutina
              </button></>}
            </form>

          </div>
          <div className={styles.closebutton} onClick={handleCloseRoutineModal}>
            X
          </div>
        </div>
      )}
      {showClient && (
        <div className={styles.share}>
          {clients
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
          <button className={styles.closebutton} onClick={() => setShowClient(false)}>X</button>
        </div>
      )}
    </div>
  );
};

export default routine;
