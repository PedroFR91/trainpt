import {
  serverTimestamp,
  doc,
  onSnapshot,
  collection,
  deleteDoc,
  updateDoc,
  addDoc,
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
  FaCopy,
} from "react-icons/fa";
import { BsFillShareFill } from "react-icons/bs";
import Training from "./training";
import { IoIosArrowForward } from "react-icons/io";
const routine = () => {
  const [data, setData] = useState([""]);
  const [exercises, setExercises] = useState([]);
  const [newexercise, setNewExercise] = useState({});
  const [trainings, setTrainings] = useState([]);
  const [routines, setRoutines] = useState([]);
  const { myData } = useContext(AuthContext);
  const [showClient, setShowClient] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routinesList, setRoutinesList] = useState(false);
  const [trainingsList, setTrainingsList] = useState(false);
  const [exercisesList, setExercisesList] = useState(false);
  const [message, setMessage] = useState(false);
  const [updateExerciseId, setUpdateExerciseId] = useState(null);
  const [updateRoutineId, setUpdateRoutineId] = useState(null)
  const [copyTrainingId, setCopyTrainingId] = useState(null);
  const [current, setCurrent] = useState(false);

  const [myMessage, setMyMessage] = useState("");

  const [clients, setClients] = useState([]);
  const [step, setStep] = useState('one')

  const [updateExercise, setUpdateExercise] = useState({})
  const [updateTraining, setUpdateTraining] = useState({})
  const [numDays, setNumDays] = useState(1);

  const [routineData, setRoutineData] = useState({
    days: [], // Días de entrenamiento
    dayTrainings: {} // Entrenamientos asignados a cada día
  });

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

  const handleDeleteExercise = async (id) => {
    try {
      await deleteDoc(doc(db, "exercises", id));
      console.log("Document deleted");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
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
  console.log(data.trainings)

  //Create Routine
  const handleCreateRoutine = async (e) => {
    e.preventDefault();

    const selectedTrainings = trainings || [];

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

    handleCloseRoutineModal()
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await deleteDoc(doc(db, "routines", id));
      console.log("Routine deleted");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleCloseRoutineModal = () => {
    setShowRoutineModal(false);
    // Restablece cualquier estado relacionado con el modal de rutina aquí
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
  const handleTrainingAssignment = (e, day) => {
    const trainingId = e.target.value; // Extraer el ID del entrenamiento del evento

    setRoutineData(prevData => {
      const updatedDayTrainings = { ...prevData.dayTrainings };

      if (updatedDayTrainings[day]) {
        updatedDayTrainings[day].push(trainingId);
      } else {
        updatedDayTrainings[day] = [trainingId];
      }

      return {
        ...prevData,
        dayTrainings: updatedDayTrainings
      };
    });
  };

  const handleNumDaysChange = (e) => {
    setNumDays(e.target.value);
    // Actualiza el estado de los días seleccionados en función del número elegido
    const selectedDays = Array.from({ length: e.target.value }, (_, i) => `Día ${i + 1}`);
    setRoutineData({ ...routineData, days: selectedDays });
  };
  console.log(trainings)

  return (
    <div className={styles.routinesContainer}>
      <div className={styles.editor}>
        {!routinesList && !trainingsList && !exercisesList && (
          <div className={styles.top}>
            <div
              className={styles.routine}
            >
              <FaCalendarDay size={150} />
              <p onClick={() => setShowRoutineModal(true)}>Crear Rutina</p>
              <p onClick={viewRoutinesList}>Ver Mis Rutinas</p>
            </div>
            <div
              className={styles.routine}
            >
              <FaRunning size={150} />
              <p onClick={() => {
                setShowTrainingModal(true);
                setCurrent(true);
              }}>Crear Entrenamiento</p>
              <p onClick={viewTrainingList}>Ver Mis Entrenamientos</p>
            </div>
            <div
              className={styles.routine}
            >
              <FaDumbbell size={150} />
              <p onClick={() => setShowExerciseModal(true)}>Crear Ejercicio</p>
              <p onClick={viewExercisesList}>Ver Mis Ejercicios</p>
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
              )}
              {trainingsList && (
                <div className={styles.myddbbitem}>
                  <h3>Mis entrenamientos</h3>
                  {trainings.map((training) => (
                    <div key={training.id} style={{
                      border: '1px solid #ffffff', width: '500px', height: '200px', padding: '1rem',
                      borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>Nombre del Entrenamiento</p>
                        <p>{training.name}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>Descripción</p>
                        <p>{training.description}</p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p>Ejercicios</p>
                        {training.exercises.map((exercise) => (
                          <div key={exercise.id}>
                            <p>Ejercicios{exercise.name}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>                 <FaRegEdit
                        size={20}
                        onClick={() => {
                          setUpdateTraining(training);
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
                        /></div>
                    </div>
                  ))}
                </div>
              )}
              {exercisesList && (
                <>
                  <div className={styles.myddbbitem}>
                    <h3>Mis ejercicios</h3>
                    {exercises.map((exercise) => (
                      <div key={exercise} className={styles.exercise}>
                        <div>
                          <p>Nombre</p>
                          <p>{exercise.name}</p>
                        </div>
                        <div>
                          <p>Material</p>
                          <p>{exercise.material}</p>
                        </div>
                        <div>
                          <p>Comentarios</p>
                          <p>{exercise.comments}</p>
                        </div>
                        <div>
                          <FaRegEdit
                            size={20}
                            onClick={() => {
                              setUpdateExercise(exercise);
                              setShowExerciseModal(true);
                            }}
                          />
                          <FaRegTrashAlt
                            size={20}
                            onClick={() => handleDeleteExercise(exercise.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
      {
        showExerciseModal && (
          <Exercise
            showExerciseModal={showExerciseModal} setShowExerciseModal={setShowExerciseModal} updateExercise={updateExercise}
          />
        )
      }
      {showTrainingModal && <Training showTrainingModal={showTrainingModal} setShowTrainingModal={setShowTrainingModal} updateTraining={updateTraining} />}
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
      {
        showClient && (
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
        )
      }
    </div >
  );
};

export default routine;
