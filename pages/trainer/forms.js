import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/forms.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';

const forms = () => {
  const [data, setData] = useState([]);
  const [myForm, setMyForm] = useState([]);
  const { myData, myUid } = useContext(AuthContext);
  const auth = getAuth();
  const user = auth.currentUser;
  const [show, setShow] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [currentForm, setCurrentForm] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    weight: '',
    height: '',
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: '',
    },
    photos: {
      front: '',
      back: '',
      lateral: '',
    },
    intolerances: '',
    preferredFoods: '',
    trainingDays: '',
  });
  const [formDataFollow, setFormDataFollow] = useState({
    measures: {
      chest: '',
      shoulders: '',
      biceps: '',
      hips: '',
      abdomen: '',
      cuadriceps: '',
      gemelos: '',
    },
    photos: {
      front: '',
      back: '',
      lateral: '',
    },
  });
  //Initial
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

  const handleSubmitFollow = (event) => {
    event.preventDefault();
    console.log(formDataFollow);
    handleCreateFollow();
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
      await setDoc(doc(db, 'forms', formData.name), {
        ...formData,
        formid: user.uid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleCreateFollow = async (e) => {
    try {
      await setDoc(doc(db, 'forms', 'ey'), {
        ...formDataFollow,
        formid: user.uid,
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
    await updateDoc(doc(db, 'forms', cf), {
      link: id,
    });
    setShowClient(false);
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />

      <div className={styles.formLayout}>
        {!show ? (
          <button onClick={() => setShow(true)}>Seguimiento</button>
        ) : (
          <button onClick={() => setShow(false)}>Initial</button>
        )}
        {!show && (
          <form onSubmit={handleSubmit} className={styles.initial}>
            <h3>Datos generales</h3>
            <label>
              <span> Nombre:</span>

              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Sexo:
              <select
                name='gender'
                value={formData.gender}
                onChange={handleChange}
              >
                <option value='man'>Hombre</option>
                <option value='woman'>Mujer</option>
              </select>
            </label>
            <br />
            <label>
              Peso
              <input
                type='text'
                name='weight'
                value={formData.weight}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Altura
              <input
                type='text'
                name='height'
                value={formData.height}
                onChange={handleChange}
              />
            </label>
            <br />
            <h3>Medidas</h3>
            <label>
              Pecho:
              <input
                type='text'
                name='chest'
                value={formData.measures.chest}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Hombros:
              <input
                type='text'
                name='shoulders'
                value={formData.measures.shoulders}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Biceps:
              <input
                type='text'
                name='biceps'
                value={formData.measures.biceps}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Cintura:
              <input
                type='text'
                name='hips'
                value={formData.measures.hips}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Abdomen:
              <input
                type='text'
                name='abdomen'
                value={formData.measures.abdomen}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Cuadriceps:
              <input
                type='text'
                name='cuadriceps'
                value={formData.measures.cuadriceps}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <label>
              Gemelos:
              <input
                type='text'
                name='gemelos'
                value={formData.measures.gemelos}
                onChange={handleMeasuresChange}
              />
            </label>
            <br />
            <h3>Fotos</h3>
            <label>
              Frente:
              <input type='file' name='front' onChange={handlePhotosChange} />
            </label>
            <br />
            <label>
              Espalda:
              <input type='file' name='back' onChange={handlePhotosChange} />
            </label>
            <br />
            <label>
              Lateral:
              <input type='file' name='lateral' onChange={handlePhotosChange} />
            </label>
            <br />
            <label>
              Intolerancias:
              <textarea
                name='intolerances'
                value={formData.intolerances}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Comida preferida:
              <textarea
                name='preferredFoods'
                value={formData.preferredFoods}
                onChange={handleChange}
              />
            </label>
            <br />
            <label>
              Días de entrenamiento:
              <select
                name='trainingDays'
                value={formData.trainingDays}
                onChange={handleChange}
              >
                <option value=''>Días de entrenamiento</option>
                <option value='3'>3 días a la semana</option>
                <option value='4'>4 días a la semana</option>
                <option value='5'>5 días a la semana</option>
              </select>
            </label>
            <br />
            <button type='submit'>Submit</button>
          </form>
        )}
        {show && (
          <form onSubmit={handleSubmitFollow} className={styles.follow}>
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
            <button type='submit'>Submit</button>
          </form>
        )}
      </div>
      <div className={styles.myforms}>
        {myForm.map((form) => (
          <div key={form.id}>
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
            <p>Medidas</p>
            <p>
              <span>Pecho:</span> <span>{form.measures.chest}</span>
            </p>
            <p>
              <span>Hombro:</span> <span>{form.measures.shoulders}</span>
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
              <span>Cuadriceps:</span> <span>{form.measures.cuadriceps}</span>
            </p>
            <p>
              <span>Gemelos:</span> <span>{form.measures.gemelos}</span>
            </p>
            <p>Fotos</p>
            <p>
              <span>Frente:</span> <span>{form.photos.front}</span>
            </p>
            <p>
              <span>Espalda:</span> <span>{form.photos.back}</span>
            </p>
            <p>
              <span>Lateral:</span> <span>{form.photos.lateral}</span>
            </p>
            <p>
              <span>Intolerancias:</span> <span>{form.intolerances}</span>
            </p>
            <p>
              <span>Comida preferida:</span> <span>{form.preferredFoods}</span>
            </p>
            <p>
              <span>Días de entrenamiento:</span>{' '}
              <span>{form.trainingDays}</span>
            </p>
            <button onClick={() => asignForm(form.id)}>
              Asignar Formulario
            </button>
          </div>
        ))}
      </div>
      {showClient && (
        <div className={styles.share}>
          {myData
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
