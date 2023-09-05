import React, { useEffect, useState } from "react";
import styles from "../../styles/files.module.css";
import TrainerHeader from "../../components/trainer/trainerHeader";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ReactPlayer from "react-player";
import { AiOutlineFile, AiOutlinePlayCircle } from "react-icons/ai";
import {
  FaEdit,
  FaFileArchive,
  FaFilePdf,
  FaFileUpload,
  FaPlayCircle,
  FaTrashAlt,
  FaUpload,
} from "react-icons/fa";
import Chat from "../../components/chat/chat";
const files = () => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [myfiles, setMyFiles] = useState([]);
  const [showvideo, setShowvideo] = useState(false);
  const [url, setUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoList, setVideoList] = useState([]);
  const [fileTitle, setFileTitle] = useState("");
  const [viewUpload, setViewUpload] = useState(false);
  const [viewMyVideos, setViewMyVideos] = useState(false);
  const [viewMyFiles, setViewMyFiles] = useState(false);
  const [viewUploadFiles, setViewUploadFiles] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    setData({ ...data, role: "trainer" });
  }, []);
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setPer(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Uoload is running");
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
      collection(db, "videos"),
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
      collection(db, "files"),
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
  useEffect(() => {
    // Verifica si hay videos en la lista
    if (videoList.length > 0) {
      // Establece la URL del primer video en el estado "url"
      setUrl(videoList[0].url);
    }
  }, [videoList]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const name = new Date().getTime() + file.name;
    try {
      await setDoc(doc(db, "files", name), {
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
      const videoDocRef = await addDoc(collection(db, "videos"), videoData);

      // Solo agrega el video a videoList después de confirmar que se agregó a Firebase
      await getDoc(videoDocRef);

      // Verifica si el video ya está en la lista antes de agregarlo
      if (!videoList.some((video) => video.url === videoData.url)) {
        setVideoList((prevState) => [
          ...prevState,
          { id: videoDocRef.id, title: videoTitle, url },
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      // Elimina el video de la lista de videos en el estado
      setVideoList((prevState) =>
        prevState.filter((video) => video.id !== videoId)
      );

      // Elimina el video de la base de datos
      await deleteDoc(doc(db, "videos", videoId));

      // Si el video que se estaba reproduciendo se eliminó, detén la reproducción
      if (url === videoList.find((video) => video.id === videoId).url) {
        setUrl("");
      }
    } catch (error) {
      console.error("Error al eliminar el video:", error);
    }
  };
  const deleteFile = async (fileId) => {
    try {
      // Elimina el archivo de la lista de archivos en el estado
      setMyFiles((prevState) => prevState.filter((file) => file.id !== fileId));

      // Elimina el archivo de la base de datos
      await deleteDoc(doc(db, "files", fileId));
    } catch (error) {
      console.error("Error al eliminar el archivo:", error);
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
                type="text"
                placeholder="Título del video"
                onChange={(e) => setVideoTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Pegue aquí su URL"
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
            <>
              <h1 style={{ marginTop: "20vh" }}>Mis Videos</h1>
              <div className={styles.myVideos}>
                <div className={styles.video}>
                  <ReactPlayer url={url} width={"80%"} />
                </div>
                <div className={styles.videoList}>
                  <h2>¿Qué quieres ver?</h2>
                  {videoList.map((video) => (
                    <>
                      <div>
                        <p
                          key={video.id}
                          onClick={() => selectVideo(video.url)}
                        >
                          {video.title ? video.title : "Sin título"}
                        </p>
                        <p>
                          <FaTrashAlt
                            size={20}
                            onClick={() => deleteVideo(video.id)}
                          />
                        </p>
                      </div>
                    </>
                  ))}
                </div>
                <div
                  className={styles.closebutton}
                  onClick={() => setViewMyVideos(false)}
                >
                  X
                </div>
              </div>
            </>
          )}
          {viewUploadFiles && (
            <div className={styles.uploadArea}>
              <h1>Suba sus archivos</h1>
              <input
                type="text"
                placeholder="Ingrese el título de su archivo aquí"
                onChange={(e) => setFileTitle(e.target.value)}
              />
              <div className={styles.filePickerContainer}>
                <label htmlFor="filepicker" className={styles.customFilePicker}>
                  Seleccionar archivo
                </label>
                <input
                  type="file"
                  id="filepicker"
                  accept="image/*,.pdf,.doc,.docx,.xml"
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
              <h1 style={{ marginTop: "20vh" }}>Mi galería</h1>
              <div className={styles.gallery}>
                {myfiles.length > 0 ? (
                  myfiles.map((item) => (
                    <div key={item.id}>
                      {item.fileType === "image/jpeg" ? (
                        <img src={item.img} alt={item.title} width="100%" />
                      ) : (
                        <FaFilePdf size={100} />
                      )}

                      <p>{item.title ? item.title : "Sin título"}</p>
                      <a href={item.img} target="_blank">
                        Ver/Descargar
                      </a>
                      <FaTrashAlt
                        size={20}
                        onClick={() => deleteFile(item.id)}
                        className={styles.links}
                      />
                    </div>
                  ))
                ) : (
                  <h1>Aún no has subido ningún archivo</h1>
                )}
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
