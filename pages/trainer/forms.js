import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/forms.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
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
import Initial from '../../components/client/Initial';
import Link from 'next/link';

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

  const handleMeasuresChange = (event) => {
    setFormData({
      ...formData,
      measures: {
        ...formData.measures,
        [event.target.name]: event.target.value,
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
    console.log(cf);
    const date = new Date();
    await updateDoc(doc(db, 'forms', cf), {
      link: id,
      dateform: date,
    });

    const docRef = doc(db, 'users', myUid);
    const userSnap = await getDoc(docRef);
    const userData = userSnap.data();

    const existingStatusIndex = userData.status.findIndex(
      (status) => status.id === id
    );

    if (existingStatusIndex !== -1) {
      // If the trainer already has a status with the same id, update only the name
      const updatedStatus = userData.status.map((status, index) => {
        if (index === existingStatusIndex) {
          return { ...status, name: 'inicial' }; // Replace 'inicial' with the desired name
        } else {
          return status;
        }
      });
      await updateDoc(docRef, {
        status: updatedStatus,
      });
    } else {
      // If the trainer doesn't have a status with the same id, add a new status
      await updateDoc(docRef, {
        status: arrayUnion({ name: 'inicial', id: id }),
      });
    }

    setShowClient(false);
  };

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.formLayout}>
        {!showinitial && !showfollow && !showmyforms && !showClient && (
          <div className={styles.menu}>
            <div
              className={styles.menuItem}
              onClick={() => setShowInitial(true)}
            >
              <FaFile size={50} />
              Inicial
            </div>
            <div
              className={styles.menuItem}
              onClick={() => setShowFollow(true)}
            >
              <FaFile size={50} />
              Seguimiento
            </div>
            <div
              className={styles.menuItem}
              onClick={() => setShowMyForms(true)}
            >
              <FaFile size={50} /> Ver Formularios
            </div>
          </div>
        )}
        {showinitial && (
          <Initial
            showinitial={showinitial}
            setShowInitial={setShowInitial}
            myUid={myUid}
          />
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
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>ID</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myForm.map((form) => (
                    <tr key={form.id}>
                      <td>{form.name}</td>
                      <td>{form.type}</td>
                      <td>{form.id}</td>
                      <td>
                        <Link href={`/share/${form.id}`}>Ver</Link>
                      </td>
                      <td
                        onClick={() => {
                          setShowClient(true), setCurrentForm(form);
                        }}
                      >
                        Asignar formulario Inicial
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                onClick={() => selectTrainer(currentForm.id, data.id)}
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
