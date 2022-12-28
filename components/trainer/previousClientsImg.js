import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/previousimg.module.css';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';

const previousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [period, setPeriod] = useState('before');
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, name);
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
              console.log('Upload is running');
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
            handleUpload();
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  const handleUpload = async () => {
    const name = new Date().getTime() + file.name;
    try {
      await setDoc(doc(db, 'clientPhotos', name), {
        ...data,
        title: file.name,
        state: period,
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.clientPhotos}>
        <div className={styles.divimage}>
          <div className={styles.myimage}>
            <img src={data.img ? data.img : '/face.png'} alt={''} />
          </div>
          <input
            type='file'
            id='filebefore'
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
            hidden
            required
          />

          <label className={styles.label} htmlFor='filebefore'>
            Seleccionar Imagen
          </label>
        </div>
      </div>
    </div>
  );
};

export default previousClientsImg;
