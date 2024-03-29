import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/previousimg.module.css';
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import { HiOutlineFolderAdd, HiOutlineUpload } from 'react-icons/hi';

const previousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [period, setPeriod] = useState('before');
  const [photos, setPhotos] = useState([]);
  const [type, setType] = useState('Frontal');

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
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);
  const handleUpload = async () => {
    try {
      await addDoc(collection(db, 'clientPhotos'), {
        ...data,
        type: type,
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
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
        <select
          name=''
          onChange={(e) => {
            setType(e.target.value);
          }}
        >
          <option value='frontal'>Frontal</option>
          <option value='lateral'>Lateral</option>
          <option value='espalda'>Espalda</option>
        </select>
        <div className={styles.labels}>
          <label className={styles.label} htmlFor='filebefore'>
            <HiOutlineFolderAdd />
          </label>
          <label className={styles.label} onClick={handleUpload}>
            <HiOutlineUpload />
          </label>
        </div>
      </div>
      <div className={styles.clientPhotos}>
        {photos
          .filter((data) => data.trainerId === myUid)
          .map((photo) => (
            <div key={photo.id}>
              <div className={styles.clientImg}>
                <img src={photo.img} alt={photo.title} />
                <p>{photo.type}</p>
              </div>
              <button onClick={() => handleDelete(photo.id)}>Borrar</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default previousClientsImg;
