import React, { useState } from "react";
import styles from "../../styles/forms.module.css";
import { initialForm } from "../../forms/initialForm";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase.config";
import { AiOutlineSend } from "react-icons/ai";
const Initial = (props) => {
  const [formStructure, setFormStructure] = useState({
    ...initialForm,
    measures: {
      chest: "",
      shoulders: "",
      biceps: "",
      hips: "",
      abdomen: "",
      cuadriceps: "",
      gemelos: "",
    },
  });

  const handleCreate = async (e) => {
    setFormStructure("");
    try {
      await addDoc(collection(db, "forms"), {
        ...formStructure,
        formid: props.myUid,
        type: "Inicial",
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
      [name]: type === "file" ? event.target.files[0] : value,
    }));
  };
  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setFormStructure((prevFormStructure) => ({
      ...prevFormStructure,
      [name]: {
        ...prevFormStructure[name],
        options: value.split(",").map((option) => option.trim()),
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
            <p>Frente:</p>
            <input type="file" name="front" onChange={handlePhotosChange} />
          </div>

          <div>
            <p>Espalda:</p>
            <input type="file" name="back" onChange={handlePhotosChange} />
          </div>

          <div>
            <p>Lateral:</p>
            <input type="file" name="lateral" onChange={handlePhotosChange} />
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
        <div onClick={handleCreate}>
          <div>
            <p>Enviar Formulario</p>
          </div>
          <div>
            <AiOutlineSend size={20} />
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
