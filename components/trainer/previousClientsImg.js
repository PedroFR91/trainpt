import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/previousimg.module.css";
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { db, storage } from "../../firebase.config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import AuthContext from "../../context/AuthContext";
import { FaPhotoVideo } from "react-icons/fa";
import { AiFillDelete, AiOutlineCloudUpload } from "react-icons/ai";

const PreviousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [fileBefore, setFileBefore] = useState(null);
  const [fileAfter, setFileAfter] = useState(null);
  const [clientName, setClientName] = useState("");
  const [photos, setPhotos] = useState([]);

  const handleInputChange = (e) => {
    setClientName(e.target.value);
  };

  const handleFileBeforeChange = (e) => {
    setFileBefore(e.target.files[0]);
  };

  const handleFileAfterChange = (e) => {
    setFileAfter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !fileBefore || !fileAfter) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    const uploadFile = async (fileToUpload, period) => {
      const name = new Date().getTime() + fileToUpload.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      try {
        await uploadTask;
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log(downloadURL);

        // Save the downloadURL to Firestore
        const photoData = {
          trainerId: myUid,
          clientName: clientName,
          period: period,
          img: downloadURL,
          title: fileToUpload.name,
          createdAt: serverTimestamp(),
        };
        try {
          await setDoc(doc(collection(db, "clientPhotos")), photoData);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // Upload both files
    uploadFile(fileBefore, "before");
    uploadFile(fileAfter, "after");

    // Clear form fields
    setClientName("");
    setFileBefore(null);
    setFileAfter(null);
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "clientPhotos"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setPhotos(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleDeleteGroup = async (client) => {
    const photosToDelete = photos.filter(
      (photo) => photo.trainerId === myUid && photo.clientName === client
    );

    await Promise.all(
      photosToDelete.map(async (photo) => {
        try {
          await deleteDoc(doc(db, "clientPhotos", photo.id));
        } catch (error) {}
      })
    );
  };

  return (
    <div className={styles.container}>
      <h2>Sube imágenes de tus clientes</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <div className={styles.inputContainer}>
            <label htmlFor="fileBefore">Antes</label>
            <input
              type="file"
              id="fileBefore"
              onChange={handleFileBeforeChange}
              accept="image/*"
              required
              hidden
            />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="fileAfter">Después</label>
            <input
              type="file"
              id="fileAfter"
              onChange={handleFileAfterChange}
              accept="image/*"
              required
              hidden
            />
          </div>
        </div>
        <button type="submit">
          <AiOutlineCloudUpload size={30} />
        </button>
      </form>
      <div className={styles.clientPhotos}>
    
        {Array.from(new Set(photos.map((photo) => photo.clientName)))
          .filter((clientName) =>
            photos.some(
              (photo) =>
                photo.clientName === clientName && photo.trainerId === myUid
            )
          )
          .map((client) => (
            <div key={client} className={styles.client}>
              <h1>{client}</h1>
              <div className={styles.clientImgGroup}>
                {photos
                  .filter(
                    (data) =>
                      data.trainerId === myUid &&
                      data.clientName === client &&
                      data.period === "before"
                  )
                  .map((photo) => (
                    <div key={photo.id} className={styles.clientImg}>
                      <img src={photo.img} alt={photo.title} />
                      <p>Antes</p>
                    </div>
                  ))}
                {photos
                  .filter(
                    (data) =>
                      data.trainerId === myUid &&
                      data.clientName === client &&
                      data.period === "after"
                  )
                  .map((photo) => (
                    <div key={photo.id} className={styles.clientImg}>
                      <img src={photo.img} alt={photo.title} />
                      <p>Después</p>
                    </div>
                  ))}
              </div>
              <button onClick={() => handleDeleteGroup(client)}>
                <AiFillDelete />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PreviousClientsImg;
