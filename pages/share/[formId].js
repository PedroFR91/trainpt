// pages/client/form/[formId].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { serverTimestamp } from 'firebase/firestore';
import styles from '../../styles/forms.module.css';
import Link from 'next/link';
const FormPage = () => {
  const router = useRouter();
  const { formId } = router.query; // Obtiene el ID del formulario desde la URL

  const [formStructure, setFormStructure] = useState(null);

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
    try {
      await addDoc(collection(db, 'forms'), {
        ...formStructure,
        formid: myUid,
        type: 'Inicial',
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    const { name, type, value } = event.target;

    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: type === 'file' ? event.target.files[0] : value,
    }));
  };
  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: {
        ...prevFormStructure[name],
        options: value.split(',').map((option) => option.trim()),
      },
    }));
  };
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: {
        ...prevFormStructure[name],
        options: {
          ...prevFormStructure[name].options,
          [event.target.value]: checked,
        },
      },
    }));
  };

  const handlePhotosChange = (event) => {
    setFormStructure({
      ...formStructure,
      photos: {
        ...formStructure.photos,
        [event.target.name]: event.target.files[0],
      },
    });
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

  if (!formStructure) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se obtienen los datos del formulario
  }

  // Renderiza el formulario con los datos obtenidos
  return (
    <div>
      <form className={styles.initial} onSubmit={handleCreate}>
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
            <p>Frente:</p>
            <input type='file' name='front' onChange={handlePhotosChange} />
          </div>

          <div>
            <p>Espalda:</p>
            <input type='file' name='back' onChange={handlePhotosChange} />
          </div>

          <div>
            <p>Lateral:</p>
            <input type='file' name='lateral' onChange={handlePhotosChange} />
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
              value={formStructure.measures.chest}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Hombros:</p>
            <input
              type='text'
              name='shoulders'
              value={formStructure.measures.shoulders}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Biceps:</p>
            <input
              type='text'
              name='biceps'
              value={formStructure.measures.biceps}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cintura:</p>
            <input
              type='text'
              name='hips'
              value={formStructure.measures.hips}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Abdomen:</p>
            <input
              type='text'
              name='abdomen'
              value={formStructure.measures.abdomen}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cuadriceps:</p>
            <input
              type='text'
              name='cuadriceps'
              value={formStructure.measures.cuadriceps}
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Gemelos:</p>
            <input
              type='text'
              name='gemelos'
              value={formStructure.measures.gemelos}
              onChange={handleMeasuresChange}
            />
          </div>
        </div>
        <button type='submit'>Enviar</button>
      </form>
      <div className={styles.closebutton} onClick={() => router.back()}>
        X
      </div>
    </div>
  );
};

export default FormPage;
