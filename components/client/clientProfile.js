import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/program.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../firebase.config';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
const clientProfile = () => {
  const { myData, myUid } = useContext(AuthContext);
  const auth = getAuth();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  useEffect(() => {
    file && handleImageUpload();
  }, [file]);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);
  const handleImageUpload = async () => {
    if (!file) return;

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, 'users', myUid), { img: downloadURL });
        });
      }
    );
  };
  return (
    <>
      {myData && (
        <div className={styles.myprofile}>
          <img
            src={myData.img ? myData.img : '/face.jpg'}
            alt={'img'}
            className={styles.myprofileimg}
          />

          <input
            type='file'
            id='file'
            onChange={(e) => setFile(e.target.files[0])}
            hidden
          />
          <div className={styles.profilesection}>
            <button
              className={styles.label}
              htmlFor='file'
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('file').click();
              }}
            >
              Cambiar imagen de perfil
            </button>
          </div>
          <div className={styles.myprofileinfo}>
            <p>{myData.username}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default clientProfile;
