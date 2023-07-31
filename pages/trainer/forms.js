import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/forms.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
import { follow, initialForm } from '../../forms/initialForm';
import { FaArrowAltCircleRight, FaFile } from 'react-icons/fa';

const forms = () => {
  const [data, setData] = useState([]);
  const [myForm, setMyForm] = useState([]);
  const { myData, myUid } = useContext(AuthContext);
  const auth = getAuth();
  const user = auth.currentUser;
  const [show, setShow] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [currentForm, setCurrentForm] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [formDataFollow, setFormDataFollow] = useState(follow);
  const [clients, setClients] = useState([]);

  const [showinitial, setShowInitial] = useState(false);
  const [showfollow, setShowFollow] = useState(false);
  const [showmyforms, setShowMyForms] = useState(false);
  //Initial

  useEffect(() => {
    if (myData) {
      // Realizar la consulta para obtener todos los usuarios
      const q = query(collection(db, 'users'));
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

  const formatDate = (timeStamp) => {
    if (!timeStamp || !timeStamp.seconds) {
      return null;
    }
    const timeStampMillis =
      timeStamp.seconds * 1000 + timeStamp.nanoseconds / 1000000;
    const date = new Date(timeStampMillis);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.type === 'file'
          ? event.target.files[0]
          : event.target.value,
    });
  };

  const handleMeasuresChange = (event) => {
    setFormData({
      ...formData,
      measures: {
        ...formData.measures,
        [event.target.name]: event.target.value,
      },
    });
  };

  const handlePhotosChange = (event) => {
    setFormData({
      ...formData,
      photos: {
        ...formData.photos,
        [event.target.name]: event.target.files[0],
      },
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(formData);
    handleCreate();
  };
  //Follow
  const handleChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      [event.target.name]:
        event.target.type === 'file'
          ? event.target.files[0]
          : event.target.value,
    });
  };

  const handleMeasuresChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      measures: {
        ...formDataFollow.measures,
        [event.target.name]: event.target.value,
      },
    });
  };

  const handlePhotosChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      photos: {
        ...formDataFollow.photos,
        [event.target.name]: event.target.files[0],
      },
    });
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyForm(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleCreate = async (e) => {
    try {
      await addDoc(collection(db, 'forms'), {
        ...formData,
        formid: myUid,
        type: 'Inicial',
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleCreateFollow = async (e) => {
    try {
      await addDoc(collection(db, 'forms'), {
        ...formDataFollow,
        formid: myUid,
        type: 'Seguimiento',
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const asignForm = (id) => {
    setShowClient(true);
    setCurrentForm(id);
  };
  const selectTrainer = async (cf, id) => {
    console.log('id', id);
    console.log('MyUid', myUid);
    const date = new Date();
    await updateDoc(doc(db, 'forms', cf), {
      link: id,
      dateform: date,
    });
    setShowClient(false);
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.formLayout}>
        <div className={styles.menu}>
          <div className={styles.menuItem} onClick={() => setShowInitial(true)}>
            <FaFile size={50} />
            Inicial
          </div>
          <div className={styles.menuItem} onClick={() => setShowFollow(true)}>
            <FaFile size={50} />
            Seguimiento
          </div>
          <div className={styles.menuItem} onClick={() => setShowMyForms(true)}>
            <FaFile size={50} /> Ver Formularios
          </div>
        </div>
        {showinitial && (
          <>
            <form className={styles.initial} onSubmit={handleCreate}>
              <div className={styles.initialLeft}>
                <div>
                  <h3>Datos generales</h3>
                  <div>
                    <p>Nombre:</p>
                    <input
                      type='text'
                      name='name'
                      placeholder='Pedro'
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <p>Sexo:</p>
                    <select
                      name='gender'
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value='man'>Hombre</option>
                      <option value='woman'>Mujer</option>
                    </select>
                  </div>

                  <div>
                    <p>Peso</p>
                    <input
                      type='text'
                      name='weight'
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <p>Altura</p>
                    <input
                      type='text'
                      name='height'
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <div>
                    <h3>Fotos</h3>
                    <div>
                      <p>Frente:</p>
                      <input
                        type='file'
                        name='front'
                        onChange={handlePhotosChange}
                      />
                    </div>

                    <div>
                      <p>Espalda:</p>
                      <input
                        type='file'
                        name='back'
                        onChange={handlePhotosChange}
                      />
                    </div>

                    <div>
                      <p>Lateral:</p>
                      <input
                        type='file'
                        name='lateral'
                        onChange={handlePhotosChange}
                      />
                    </div>
                  </div>
                  <div>
                    <h3>Dieta</h3>
                    <div>
                      <p>Intolerancias:</p>
                      <textarea
                        name='intolerances'
                        value={formData.intolerances}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <p>Comida preferida:</p>
                      <textarea
                        name='preferredFoods'
                        value={formData.preferredFoods}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <p>Días de entrenamiento:</p>
                      <select
                        name='trainingDays'
                        value={formData.trainingDays}
                        onChange={handleChange}
                      >
                        <option value=''>Días de entrenamiento</option>
                        <option value='1'>1 día a la semana</option>
                        <option value='2'>2 días a la semana</option>
                        <option value='3'>3 días a la semana</option>
                        <option value='4'>4 días a la semana</option>
                        <option value='5'>5 días a la semana</option>
                        <option value='6'>6 días a la semana</option>
                        <option value='7'>7 días a la semana</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.initialRight}>
                <h3>Medidas</h3>
                <div>
                  <p>Pecho:</p>
                  <input
                    type='text'
                    name='chest'
                    value={formData.measures.chest}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Hombros:</p>
                  <input
                    type='text'
                    name='shoulders'
                    value={formData.measures.shoulders}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Biceps:</p>
                  <input
                    type='text'
                    name='biceps'
                    value={formData.measures.biceps}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Cintura:</p>
                  <input
                    type='text'
                    name='hips'
                    value={formData.measures.hips}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Abdomen:</p>
                  <input
                    type='text'
                    name='abdomen'
                    value={formData.measures.abdomen}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Cuadriceps:</p>
                  <input
                    type='text'
                    name='cuadriceps'
                    value={formData.measures.cuadriceps}
                    onChange={handleMeasuresChange}
                  />
                </div>

                <div>
                  <p>Gemelos:</p>
                  <input
                    type='text'
                    name='gemelos'
                    value={formData.measures.gemelos}
                    onChange={handleMeasuresChange}
                  />
                </div>
              </div>
              <button type='submit'>Enviar</button>
            </form>
            <div
              className={styles.closebutton}
              onClick={() => setShowInitial(false)}
            >
              X
            </div>
          </>
        )}
        {showfollow && (
          <>
            <form onSubmit={handleCreateFollow} className={styles.follow}>
              <div className={styles.followLeft}>
                <div>
                  <h3>Medidas</h3>
                  <label>
                    Chest:
                    <input
                      type='text'
                      name='chest'
                      value={formDataFollow.measures.chest}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Hombros:
                    <input
                      type='text'
                      name='shoulders'
                      value={formDataFollow.measures.shoulders}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Biceps:
                    <input
                      type='text'
                      name='biceps'
                      value={formDataFollow.measures.biceps}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Cintura:
                    <input
                      type='text'
                      name='hips'
                      value={formDataFollow.measures.hips}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Abdomen:
                    <input
                      type='text'
                      name='abdomen'
                      value={formDataFollow.measures.abdomen}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Cuadriceps:
                    <input
                      type='text'
                      name='cuadriceps'
                      value={formDataFollow.measures.cuadriceps}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Gemelos:
                    <input
                      type='text'
                      name='gemelos'
                      value={formDataFollow.measures.gemelos}
                      onChange={handleMeasuresChangeFollow}
                    />
                  </label>
                  <br />
                </div>
              </div>
              <div className={styles.followRight}>
                <div>
                  <h3>Fotos</h3>
                  <label>
                    Frontal:
                    <input
                      type='file'
                      name='front'
                      onChange={handlePhotosChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Espalda:
                    <input
                      type='file'
                      name='back'
                      onChange={handlePhotosChangeFollow}
                    />
                  </label>
                  <br />
                  <label>
                    Lateral:
                    <input
                      type='file'
                      name='lateral'
                      onChange={handlePhotosChangeFollow}
                    />
                  </label>
                  <br />
                </div>
              </div>
              <button type='submit'>Enviar</button>
            </form>
            <div
              className={styles.closebutton}
              onClick={() => setShowFollow(false)}
            >
              X
            </div>
          </>
        )}
        {showmyforms && (
          <>
            <div className={styles.myforms}>
              {myForm.map((form) => (
                <div key={form.id}>
                  {form.type === 'Inicial' && (
                    <div>
                      <h2>Datos Personales</h2>
                      <p>
                        <span>Nombre:</span> <span>{form.name}</span>
                      </p>
                      <p>
                        <span>Sexo:</span> <span>{form.gender}</span>
                      </p>
                      <p>
                        <span>Peso:</span> <span>{form.weight}</span>
                      </p>
                      <p>
                        <span>Altura:</span> <span>{form.height}</span>
                      </p>
                    </div>
                  )}
                  <div>
                    <h2>Medidas</h2>
                    <p>
                      <span>Pecho:</span> <span>{form.measures.chest}</span>
                    </p>
                    <p>
                      <span>Hombro:</span>{' '}
                      <span>{form.measures.shoulders}</span>
                    </p>
                    <p>
                      <span>Biceps:</span> <span>{form.measures.biceps}</span>
                    </p>
                    <p>
                      <span>Cintura:</span> <span>{form.measures.hips}</span>
                    </p>
                    <p>
                      <span>Abdomen:</span> <span>{form.measures.abdomen}</span>
                    </p>
                    <p>
                      <span>Cuadriceps:</span>{' '}
                      <span>{form.measures.cuadriceps}</span>
                    </p>
                    <p>
                      <span>Gemelos:</span> <span>{form.measures.gemelos}</span>
                    </p>
                    <h2>Fotos</h2>
                    <p>
                      <span>Frente:</span> <span>{form.photos.front}</span>
                    </p>
                    <p>
                      <span>Espalda:</span> <span>{form.photos.back}</span>
                    </p>
                    <p>
                      <span>Lateral:</span> <span>{form.photos.lateral}</span>
                    </p>
                  </div>
                  {form.type === 'Inicial' && (
                    <div>
                      <h2>Más información</h2>
                      <p>
                        <span>Intolerancias:</span>{' '}
                        <span>{form.intolerances}</span>
                      </p>
                      <p>
                        <span>Comida preferida:</span>{' '}
                        <span>{form.preferredFoods}</span>
                      </p>
                      <p>
                        <span>Días de entrenamiento:</span>{' '}
                        <span>{form.trainingDays}</span>
                      </p>
                    </div>
                  )}
                  <p>
                    <span>Fecha de envío:</span>
                    <span>{formatDate(form.timeStamp)}</span>
                  </p>
                  <button onClick={() => asignForm(form.id)}>
                    Asignar Formulario
                  </button>
                </div>
              ))}
            </div>
            <div
              className={styles.closebutton}
              onClick={() => setShowMyForms(false)}
            >
              X
            </div>
          </>
        )}
      </div>
      {showClient && (
        <div className={styles.share}>
          {clients
            .filter((data) => data.role === 'client')
            .map((data) => (
              <div
                key={data.id}
                onClick={() => selectTrainer(currentForm, data.id)}
              >
                <div>
                  {data.img ? (
                    <img src={data.img} alt={'myprofileimg'} />
                  ) : (
                    <img src='/face.jpg' alt={'myprofileimg'} />
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

export default forms;
