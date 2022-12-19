import React, { useEffect, useState } from 'react';
import styles from '../../styles/files.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import { db, storage } from '../../firebase.config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const files = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [myfiles, setMyFiles] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    setData({ ...data, role: 'trainer' });
  }, []);
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

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'files'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyFiles(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'files', 'prueba'), {
        ...data,
        id: user.uid,
        timeStamp: serverTimestamp(),
      });
      console.log(myfiles);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.uploadFiles}>
        <h1>Suba sus archivos</h1>
        <div>
          <h3>Archivos subidos</h3>
          <div></div>
          <input
            type='file'
            name=''
            id=''
            accept='image/*,.pdf,.doc,.docx,.xml'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUpload}>Subir Archivo</button>
        </div>
      </div>
    </div>
  );
};

export default files;
