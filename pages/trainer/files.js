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
import {
  FaFileArchive,
  FaFileUpload,
  FaPlayCircle,
  FaTrashAlt,
  FaUpload,
} from 'react-icons/fa';
import Chat from '../../components/chat/chat';
const files = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [myfiles, setMyFiles] = useState([]);
  const [showvideo, setShowvideo] = useState(false);
  const [url, setUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoList, setVideoList] = useState([]);
  const [fileTitle, setFileTitle] = useState('');
  const [viewUpload, setViewUpload] = useState(false);
  const [viewMyVideos, setViewMyVideos] = useState(false);
  const [viewMyFiles, setViewMyFiles] = useState(false);
  const [viewUploadFiles, setViewUploadFiles] = useState(false);
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
  };

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.menu}>
        <div className={styles.menuItem} onClick={() => setViewUpload(true)}>
          <FaUpload size={50} /> Subir Video
        </div>
        <div className={styles.menuItem} onClick={() => setViewMyVideos(true)}>
          <FaPlayCircle size={50} /> Ver Videos
        </div>
        <div
          className={styles.menuItem}
          onClick={() => setViewUploadFiles(true)}
        >
          <FaFileUpload size={50} /> Subir Archivo
        </div>
        <div className={styles.menuItem} onClick={() => setViewMyFiles(true)}>
          <FaFileArchive size={50} /> Ver Archivos
        </div>
      </div>
      {(viewUpload || viewMyVideos || viewUploadFiles || viewMyFiles) && (
        <div className={styles.uploadFiles}>
          {viewUpload && (
            <div className={styles.videoArea}>
              <h1>Sube tu vídeo</h1>
              <p>
                Desde aquí puedes subir la URL del vídeo que quieras añadir a tu
                reproductor.
              </p>
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
              <button onClick={addVideo}>Subir</button>
              <div
                className={styles.closebutton}
                onClick={() => setViewUpload(false)}
              >
                X
              </div>
            </div>
          )}
          {viewMyVideos && (
            <div className={styles.myVideos}>
              <div className={styles.video}>
                <ReactPlayer url={url} width={'100%'} />
              </div>
              <div className={styles.videoList}>
                {videoList.map((video) => (
                  <div>
                    <p key={video.id} onClick={() => selectVideo(video.url)}>
                      {video.title ? video.title : 'Sin título'}
                    </p>
                    <FaTrashAlt size={20} />
                  </div>
                ))}
              </div>
              <div
                className={styles.closebutton}
                onClick={() => setViewMyVideos(false)}
              >
                X
              </div>
            </div>
          )}
          {viewUploadFiles && (
            <div className={styles.uploadArea}>
              <h1>Suba sus archivos</h1>
              <input
                type='text'
                placeholder='Ingrese el título de su archivo aquí'
                onChange={(e) => setFileTitle(e.target.value)}
              />
              <div className={styles.filePickerContainer}>
                <label htmlFor='filepicker' className={styles.customFilePicker}>
                  Seleccionar archivo
                </label>
                <input
                  type='file'
                  id='filepicker'
                  accept='image/*,.pdf,.doc,.docx,.xml'
                  onChange={(e) => setFile(e.target.files[0])}
                  className={styles.ocult}
                />
              </div>
              <button onClick={handleUpload}>Subir Archivo</button>
              <div
                className={styles.closebutton}
                onClick={() => setViewUploadFiles(false)}
              >
                X
              </div>
            </div>
          )}
          {viewMyFiles && (
            <>
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
              <div
                className={styles.closebutton}
                onClick={() => setViewMyFiles(false)}
              >
                X
              </div>
            </>
          )}
        </div>
      )}
      <Chat />
    </div>
  );
};

export default files;
