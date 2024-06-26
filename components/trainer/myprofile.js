import React, { useState, useEffect, useContext } from "react";
import styles from "../../styles/myprofile.module.css";
import { db, storage } from "../../firebase.config";
import { doc, updateDoc } from "firebase/firestore";
import AuthContext from "../../context/AuthContext";
import AddText from "../../components/trainer/addText";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AiFillEdit } from "react-icons/ai";

const myprofile = () => {
  const { myData, myUid } = useContext(AuthContext);
  const [file, setFile] = useState(null); // Estado para almacenar el archivo de imagen seleccionado

  useEffect(() => {
    file && handleImageUpload();
  }, [file]);

  const handleImageUpload = async () => {
    if (!file) return;

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, "users", myUid), { img: downloadURL });
        });
      }
    );
  };


  return (
    <>
      {myData && (
        <>
          <h1>Mi perfil</h1>
          <div className={styles.myprofile} >
            <img
              src={myData.img ? myData.img : "/face.jpg"}
              alt={"img"}
              className={styles.myprofileimg}
            />
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              hidden
            />
            <button
              className={styles.profilesection}
              htmlFor="file"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("file").click();
              }}
            >
              <AiFillEdit size={30} />
            </button>
            <h2>{myData.username}</h2>
            <div className={styles.myprofileinfo}>
              <AddText />
            </div>
          </div>
        </>)}
    </>
  );
};

export default myprofile;
