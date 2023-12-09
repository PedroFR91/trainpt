import React, { useContext, useState } from "react";
import styles from "../../styles/forms.module.css";
import { follow } from "../../forms/initialForm";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { AiOutlineSend, AiOutlineUpload } from "react-icons/ai";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import AuthContext from '../../context/AuthContext';

const Follow = (props) => {
  const { myUid } = useContext(AuthContext);
  const [formStructure, setFormStructure] = useState({
    follow
  });

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      // Agregar el formulario a Firestore y obtener su ID
      const formRef = await addDoc(collection(db, "forms"), {
        ...formStructure,
        type: "Seguimiento",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      });

      // Limpiar el estado del formulario
      setFormStructure({
        ...follow,
        front: null,
        back: null,
        lateral: null,
      });

      console.log("Formulario creado con éxito", formRef.id);
    } catch (error) {
      console.error("Error al crear el formulario:", error);
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
            <p>Guardar Formulario</p>
          </div>

        </div>
      </form>
      <div
        className={styles.closebutton}
        onClick={() => props.setShowFollow(false)}
      >
        X
      </div>
    </div>
  );
};

export default Follow;
