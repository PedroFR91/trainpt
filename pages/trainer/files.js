import React, { useEffect, useState } from 'react';
import styles from '../../styles/files.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import { db, storage } from '../../firebase.config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ReactPlayer from 'react-player';
import { AiOutlineFile, AiOutlinePlayCircle } from 'react-icons/ai';
const files = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [myfiles, setMyFiles] = useState([]);
  const [showvideo, setShowvideo] = useState(false);
  const [url, setUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoList, setVideoList] = useState([]); // [{id:1, title:'video1', url:'https://www.youtube.com/watch?v=1'}
  const [fileTitle, setFileTitle] = useState('');

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
      collection(db, 'videos'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setVideoList(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

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
        title: fileTitle,
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
    const videoData = {
      url: url,
      title: videoTitle,
      trainerId: user.uid,
      timeStamp: serverTimestamp(),
    };
    try {
      const videoDocRef = await addDoc(collection(db, 'videos'), videoData);
      const videoDoc = await getDoc(videoDocRef);
      setVideoList((prevState) => [
        ...prevState,
        { id: videoDoc.id, title: videoTitle, url },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  const selectVideo = (url) => {
    setUrl(url);
    setShowvideo(true);
  };
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.uploadFiles}>
        <div className={styles.videoArea}>
          <h1>Vídeos</h1>
          <input
            type='text'
            placeholder='Título del video'
            onChange={(e) => setVideoTitle(e.target.value)}
          />
          <input
            type='text'
            placeholder='Pegue aquí su URL'
            onChange={(e) => setUrl(e.target.value)}
          />
          <AiOutlinePlayCircle
            style={{
              fontSize: '36px',
              cursor: 'pointer',
            }}
            onClick={addVideo}
          />
          <div className={styles.video}>
            {showvideo && <ReactPlayer url={url} width={'100%'} />}
          </div>
          <div className={styles.videoList}>
            {videoList.map((video) => (
              <div key={video.id}>
                <p
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectVideo(video.url)}
                >
                  {video.title}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.uploadArea}>
          <h1>Suba sus archivos</h1>
          <input
            type='text'
            placeholder='Ingrese el título de su archivo aquí'
            onChange={(e) => setFileTitle(e.target.value)}
          />
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
              <AiOutlineFile
                style={{
                  fontSize: '60px',
                }}
              />
              <p>{item.title}</p>
              <a href={item.img} target='_blank'>
                Ver/Descargar
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default files;
