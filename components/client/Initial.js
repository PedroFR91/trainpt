import React, { useState } from "react";
import styles from "../../styles/forms.module.css";
import { initialForm } from "../../forms/initialForm";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { AiOutlineSend, AiOutlineUpload } from "react-icons/ai";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';
import { useContext } from "react";
const Initial = (props) => {
  const { myUid } = useContext(AuthContext);
  const [formStructure, setFormStructure] = useState({
    ...initialForm,
    gender: "man",
  });
  const [additionalFields, setAdditionalFields] = useState([]);

  const addField = (type) => {
    const newField = {
      type: type,
      label: "",
      value: "",
      newOption: "", // Nuevo campo para manejar la opción que se está agregando
      options: type === "select" ? [] : undefined,
    };
    setAdditionalFields([...additionalFields, newField]);
  };


  const handleLabelChange = (e, index) => {
    const updatedFields = [...additionalFields];
    updatedFields[index].label = e.target.value;
    setAdditionalFields(updatedFields);
  };

  const handleNewOptionChange = (e, index) => {
    const updatedFields = [...additionalFields];
    updatedFields[index].newOption = e.target.value;
    setAdditionalFields(updatedFields);
  };

  const addSelectOption = (index) => {
    const updatedFields = [...additionalFields];
    if (updatedFields[index].newOption.trim() !== "") {
      updatedFields[index].options.push(updatedFields[index].newOption);
      updatedFields[index].newOption = ""; // Limpiar después de añadir
    }
    setAdditionalFields(updatedFields);
  };


  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      // Agregar el formulario a Firestore y obtener su ID
      const formRef = await addDoc(collection(db, "forms"), {
        ...formStructure,
        type: "Inicial",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      });

      // Actualizar el documento del usuario con el ID del formulario
      const userDocRef = doc(db, "users", myUid); // Asumiendo que myUid es el ID del usuario
      await updateDoc(userDocRef, {
        initialForm: formRef.id
      });

      // Limpiar el estado del formulario
      setFormStructure({
        ...initialForm,
        gender: "man",
        front: null,
        back: null,
        lateral: null,
      });

      console.log("Formulario creado con éxito y guardado en el usuario", formRef.id);
    } catch (error) {
      console.error("Error al crear el formulario y actualizar el usuario:", error);
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

  return (
    <div>
      <form className={styles.initial}>
        <h3>Datos generales</h3>
        <div>
          <div>
            <p>Nombre:</p>
            <input
              type="text"
              name="name"
              placeholder="Pedro"
              value={formStructure.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <p>Sexo:</p>
            <select
              name="gender"
              type="select"
              value={formStructure.gender}
              onChange={handleChange}
            >
              <option value="man">Hombre</option>
              <option value="woman">Mujer</option>
            </select>
          </div>
          <div>
            <p>Peso</p>
            <input
              type="text"
              name="weight"
              value={formStructure.weight}
              onChange={handleChange}
            />
          </div>
          <div>
            <p>Altura</p>
            <input
              type="text"
              name="height"
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
              name="intolerances"
              value={formStructure.intolerances}
              onChange={handleChange}
            />
          </div>

          <div>
            <p>Preferencias de comida:</p>
            <textarea
              name="preferredFoods"
              value={formStructure.preferredFoods}
              onChange={handleChange}
            />
          </div>
          <div>
            <p>{initialForm.trainingDays.label}</p>
            <select
              name="trainingDays"
              value={formStructure.trainingDays}
              onChange={handleChange}
            >
              <option value="">{initialForm.trainingDays.label}</option>
              {initialForm.trainingDays.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <h3>Medidas</h3>
        <div>
          <div>
            <p>Pecho:</p>
            <input
              type="text"
              name="chest"
              value={
                formStructure.measures ? formStructure.measures.chest || "" : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Hombros:</p>
            <input
              type="text"
              name="shoulders"
              value={
                formStructure.measures
                  ? formStructure.measures.shoulders || ""
                  : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Biceps:</p>
            <input
              type="text"
              name="biceps"
              value={
                formStructure.measures
                  ? formStructure.measures.biceps || ""
                  : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cintura:</p>
            <input
              type="text"
              name="hips"
              value={
                formStructure.measures ? formStructure.measures.hips || "" : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Abdomen:</p>
            <input
              type="text"
              name="abdomen"
              value={
                formStructure.measures
                  ? formStructure.measures.abdomen || ""
                  : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Cuadriceps:</p>
            <input
              type="text"
              name="cuadriceps"
              value={
                formStructure.measures
                  ? formStructure.measures.cuadriceps || ""
                  : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>

          <div>
            <p>Gemelos:</p>
            <input
              type="text"
              name="gemelos"
              value={
                formStructure.measures
                  ? formStructure.measures.gemelos || ""
                  : ""
              }
              onChange={handleMeasuresChange}
            />
          </div>
        </div>
        <h3>Preguntas extra:</h3>
        <button onClick={() => addField("text")}>Añadir Campo de Texto</button>
        <button onClick={() => addField("select")}>Añadir Campo de Selección</button>
        {additionalFields.map((field, index) => (
          <div key={index}>
            <div>
              <input
                type="text"
                placeholder="Etiqueta"
                value={field.label}
                onChange={(e) => handleLabelChange(e, index)}
              />
            </div>

            <label>
              {field.label}
              {field.type === "text" ? (
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleAdditionalFieldChange(e, index)}
                />
              ) : (
                <>
                  <select onChange={(e) => handleAdditionalFieldChange(e, index)}>
                    {field.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div>
                    <input
                      type="text"
                      placeholder="Nueva Opción"
                      value={field.newOption}
                      onChange={(e) => handleNewOptionChange(e, index)}
                    />
                    <button onClick={() => addSelectOption(index)}>Añadir Opción</button>
                  </div>
                </>
              )}
            </label>
          </div>
        ))}

        <div onClick={handleCreate}>
          <div>
            <p>Guardar Formulario</p>
          </div>

        </div>
      </form>
      <div
        className={styles.closebutton}
        onClick={() => props.setShowInitial(false)}
      >
        X
      </div>
    </div>
  );
};

export default Initial;
