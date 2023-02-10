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
import ReactPlayer from 'react-player';
const files = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [myfiles, setMyFiles] = useState([]);
  const [showvideo, setShowvideo] = useState(false);
  const [url, setUrl] = useState('');
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
    const name = new Date().getTime() + file.name;
    try {
      await setDoc(doc(db, 'files', name), {
        ...data,
        fileType: file.type,
        title: file.name,
        size: file.size,
        trainerId: user.uid,
        timeStamp: serverTimestamp(),
      });
      console.log(myfiles);
    } catch (error) {
      console.log(error);
    }
  };

  const addVideo = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'videos', 'video'), {
        url: url,
        trainerId: user.uid,
        timeStamp: serverTimestamp(),
      });
      setShowvideo(true);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />

      <div className={styles.uploadFiles}>
        <div className={styles.videoArea}>
          <h1>Reproductor de Video</h1>
          <input
            type='text'
            placeholder='Pegue aquí su URL'
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={addVideo}>Añadir video</button>
          <div className={styles.video}>
            {showvideo && <ReactPlayer url={url} width={'100%'} />}
          </div>
        </div>
        <h1>Suba sus archivos</h1>
        <div>
          <input
            type='file'
            id='filepicker'
            accept='image/*,.pdf,.doc,.docx,.xml'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleUpload}>Subir Archivo</button>
        </div>
        <div className={styles.gallery}>
          {myfiles.map((item) => (
            <div key={item.id}>
              <img
                src={item.fileType === 'image/jpeg' ? item.img : '/doc.png'}
              />
              <p>{item.title.substr(0, 15)}</p>
              <a href={item.img}>Ver/Descargar</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default files;
