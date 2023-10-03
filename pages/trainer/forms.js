import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/forms.module.css";
import TrainerHeader from "../../components/trainer/trainerHeader";
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
} from "firebase/firestore";
import { db } from "../../firebase.config";
import { getAuth } from "firebase/auth";
import AuthContext from "../../context/AuthContext";
import { follow, initialForm } from "../../forms/initialForm";
import { FaArrowAltCircleRight, FaFile } from "react-icons/fa";
import Initial from "../../components/client/Initial";
import Follow from "../../components/client/Follow"
import Link from "next/link";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  storage,
} from "firebase/storage";

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
  const [imageIds, setImageIds] = useState([]);

  //Initial

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
    setFormDataFollow({
      ...formDataFollow,
      measures: {
        ...formDataFollow.measures,
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
        event.target.type === "file"
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

  const handlePhotosChangeFollow = async (event) => {
    const imageFile = event.target.files[0];

    try {
      const storageRef = ref(storage, "images/" + imageFile.name);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Manejar el progreso de la carga si es necesario
        },
        (error) => {
          console.error("Error al subir la imagen:", error);
        },
        () => {
          // Cuando la carga se completa con éxito, obtener el ID de la imagen
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // Agregar el ID de la imagen al array
            setImageIds((prevImageIds) => [...prevImageIds, downloadURL]);
          });
        }
      );
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forms"),
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
    e.preventDefault();
    try {
      const formDataWithImages = {
        ...formDataFollow,
        formid: myUid,
        type: "Seguimiento",
        timeStamp: serverTimestamp(),
        images: imageIds, // Agregar los IDs de las imágenes al formulario
      };

      await addDoc(collection(db, "forms"), formDataWithImages);
    } catch (error) {
      console.log(error);
    }
  };

  const asignForm = (id) => {
    setShowClient(true);
    setCurrentForm(id);
  };
  const selectTrainer = async (cf, id) => {
    console.log("id", id);
    console.log("MyUid", myUid);
    console.log(cf);
    const date = new Date();
    await updateDoc(doc(db, "forms", cf), {
      link: id,
      dateform: date,
    });

    const docRef = doc(db, "users", myUid);
    const userSnap = await getDoc(docRef);
    const userData = userSnap.data();

    const existingStatusIndex = userData.status.findIndex(
      (status) => status.id === id
    );

    if (existingStatusIndex !== -1) {
      // If the trainer already has a status with the same id, update only the name
      const updatedStatus = userData.status.map((status, index) => {
        if (index === existingStatusIndex) {
          return { ...status, name: "inicial" }; // Replace 'inicial' with the desired name
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
        status: arrayUnion({ name: "inicial", id: id }),
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
          <Follow showfollow={showfollow}
            setShowFollow={setShowFollow}
            myUid={myUid} />
        )}
        {showmyforms && (
          <>

            <table className={styles.myddbbitem}>
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
                    <td

                      className={styles.myddbbitem}
                    >
                      <Link href={`/shared/forms/${form.id}`}>Ver</Link>
                      <div onClick={() => {
                        setShowClient(true), setCurrentForm(form);
                      }}>
                        Asignar
                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>


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
            .filter((data) => data.role === "client")
            .map((data) => (
              <div
                key={data.id}
                onClick={() => selectTrainer(currentForm.id, data.id)}
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

export default forms;
