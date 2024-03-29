// pages/client/form/[formId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../../firebase.config';
import { serverTimestamp } from 'firebase/firestore';
import { initialForm } from "../../../forms/initialForm";
import styles from './sharedform.module.css';
import { AiOutlineUpload } from 'react-icons/ai';

const FormPage = () => {
  const router = useRouter();
  const { formId } = router.query; // Obtiene el ID del formulario desde la URL
  const { clientId } = router.query;

  const [formStructure, setFormStructure] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    if (router.isReady && clientId) {
      const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", clientId));
      getDocs(subsQuery).then(querySnapshot => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id; // Aquí capturas el ID del documento
          setSubscription({ ...docData, id: docId }); // Guarda los datos de la suscripción y el ID del documento en el estado
        } else {
          console.error("No se encontró la suscripción para el cliente:", clientId);
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error al obtener la suscripción:", error);
        setLoading(false);
      });
    }

  }, [clientId]);


  useEffect(() => {
    const fetchFormStructure = async () => {
      try {
        // Consulta el formulario usando el ID obtenido desde la URL
        const formDoc = doc(db, 'forms', formId);
        const formSnapshot = await getDoc(formDoc);
        if (formSnapshot.exists()) {
          // Si el formulario existe en la base de datos, establece los datos en el estado
          setFormStructure(formSnapshot.data());
        } else {
          // Maneja el caso si el formulario no se encuentra en la base de datos
          console.log('Formulario no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener el formulario:', error);
      }
    };

    if (formId) {
      fetchFormStructure(); // Llama a la función para obtener los datos del formulario
    }
  }, [formId]);


  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      // Agregar el formulario a Firestore y obtener su ID
      const formRef = await addDoc(collection(db, "forms"), {
        ...formStructure,
        type: "ClienteInicial",
        clientId: clientId,
        timeStamp: serverTimestamp(),
      });

      console.log("Formulario creado con éxito", formRef.id);

      // Actualizar el estado de la suscripción a 'revision'
      if (subscription && subscription.id) {
        await updateDoc(doc(db, 'subscriptions', subscription.id), {
          status: 'revision',
        });
        console.log(`Estado de suscripción actualizado a 'revision'.`);
      }

      // Redirigir a la página anterior o donde corresponda
      router.back();
    } catch (error) {
      console.error("Error al crear el formulario o actualizar la suscripción:", error);
    }
  };

  const handleChange = (event) => {
    const { name, type, value } = event.target;

    if (type !== "file") {
      // Manejar otros campos como lo estás haciendo actualmente
      setFormStructure((prevFormStructure) => ({
        ...prevFormStructure,
        [name]: value,
      }));
    }
  };

  const handleMeasuresChange = (event) => {
    setFormStructure({
      ...formStructure,
      measures: {
        ...formStructure.measures,
        [event.target.name]: event.target.value,
      },
    });
  };
  const uploadPhoto = async (fieldName, file) => {
    if (file) {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        setFormStructure((prevFormStructure) => ({
          ...prevFormStructure,
          [fieldName]: downloadURL,
        }));
      } catch (error) {
        console.error(`Error al subir ${fieldName}:`, error);
      }
    }
  };


  if (!formStructure) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se obtienen los datos del formulario
  }

  // Renderiza el formulario con los datos obtenidos
  return (
    <div>
      <form className={styles.initial} >
        <h3>Datos generales</h3>
        <div>
          <div>
            <p>Nombre:</p>
            <input
              type='text'
              name='name'
              placeholder='Pedro'
              value={formStructure.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <p>Sexo:</p>
            <select
              name='gender'
              value={formStructure.gender}
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
              value={formStructure.weight}
              onChange={handleChange}
            />
          </div>
          <div>
            <p>Altura</p>
            <input
              type='text'
              name='height'
              value={formStructure.height}
              onChange={handleChange}
            />
          </div>
        </div>
        <h3>Fotos</h3>
        <div>
          <div>
            <label htmlFor="front">
              Frente<AiOutlineUpload />
            </label>
            <input
              type="file"
              id="front"
              name="front"
              accept="image/*"
              required
              onChange={(e) => uploadPhoto("front", e.target.files[0])}
              hidden
            />
          </div>
          <div>
            <label htmlFor="back">
              Espalda<AiOutlineUpload />
            </label>
            <input
              type="file"
              id="back"
              name="back"
              accept="image/*"
              required
              onChange={(e) => uploadPhoto("back", e.target.files[0])}
              hidden
            />
          </div>
          <div>
            <label htmlFor="lateral">
              Lateral <AiOutlineUpload />
            </label>
            <input
              type="file"
              id="lateral"
              name="lateral"
              accept="image/*"
              required
              onChange={(e) => uploadPhoto("lateral", e.target.files[0])}
              hidden
            />
          </div>
        </div>
        <h3>Dieta</h3>
        <div>
          <div>
            <p>Intolerancias:</p>
            <textarea
              name='intolerances'
              value={formStructure.intolerances}
              onChange={handleChange}
            />
          </div>

          <div>
            <p>Preferencias de comida:</p>
            <textarea
              name='preferredFoods'
              value={formStructure.preferredFoods}
              onChange={handleChange}
            />
          </div>
        </div>
        <h3>Medidas</h3>
        <div>
          <div>
            <p>Pecho:</p>
            <input
              type='text'
              name='chest'
              value={formStructure.measures?.chest}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Hombros:</p>
            <input
              type='text'
              name='shoulders'
              value={formStructure.measures?.shoulders}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Biceps:</p>
            <input
              type='text'
              name='biceps'
              value={formStructure.measures?.biceps}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cintura:</p>
            <input
              type='text'
              name='hips'
              value={formStructure.measures?.hips}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Abdomen:</p>
            <input
              type='text'
              name='abdomen'
              value={formStructure.measures?.abdomen}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cuadriceps:</p>
            <input
              type='text'
              name='cuadriceps'
              value={formStructure.measures?.cuadriceps}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Gemelos:</p>
            <input
              type='text'
              name='gemelos'
              value={formStructure.measures?.gemelos}
              onChange={handleMeasuresChange}
            />
          </div>
        </div>
        <div onClick={handleCreate}>Enviar</div>

      </form>
      <div className={styles.closebutton} onClick={() => router.back()}>
        X
      </div>
    </div>
  );
};

export default FormPage;
