import React, { useEffect, useState } from 'react';
import styles from '../../styles/previousimg.module.css';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { async } from '@firebase/util';
import { auth, db, storage } from '../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
const previousClientsImg = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          setPer(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Uoload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          //Handle unsuccessful uplods
          console.log(error);
        },
        () => {
          //Handle succesful upload on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  return (
    <div className={styles.container}>
      <div className={styles.divimage}>
        <div className={styles.myimage}>
          <img src={data.img ? data.img : '/face.png'} alt={''} />
        </div>
        <input
          type='file'
          id='file'
          onChange={(e) => setFile(e.target.files[0])}
          hidden
          required
        />
        <label className={styles.label} htmlFor='file'>
          Ahora
        </label>
      </div>
      <div className={styles.divimage}>
        <div className={styles.myimage}>
          <img src={data.img ? data.img : '/face.png'} alt={''} />
        </div>
        <input
          type='file'
          id='file'
          onChange={(e) => setFile(e.target.files[0])}
          hidden
          required
        />
        <label className={styles.label} htmlFor='file'>
          Antes
        </label>
      </div>
    </div>
  );
};

export default previousClientsImg;
