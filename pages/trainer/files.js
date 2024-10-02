// pages/trainer/files.js

import React, { useEffect, useState, useContext } from "react";
import styles from "../../styles/files.module.css";
import TrainerHeader from "../../components/trainer/trainerHeader";
import { db, storage } from "../../firebase.config";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  Image,
  Button,
  message,
  Modal,
  Input,
  Tabs,
  Upload,
  Form,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  InboxOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { FaTrashAlt, FaFilePdf, FaFileExcel, FaFileWord, FaFileAlt } from "react-icons/fa";
import ReactPlayer from "react-player";
import AuthContext from "../../context/AuthContext";
import withAuth from "../../components/withAuth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const { Meta } = Card;
const { Dragger } = Upload;
const { TabPane } = Tabs;

const Files = () => {
  const { myUid } = useContext(AuthContext);

  // Estados para Videos
  const [videoList, setVideoList] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadVideoModalVisible, setUploadVideoModalVisible] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");

  // Estados para Archivos
  const [fileList, setFileList] = useState([]);

  // Estados para Fotos
  const [photoList, setPhotoList] = useState([]);

  // Fetch Videos from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "videos"),
      (snapshot) => {
        let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setVideoList(list);
      },
      (error) => console.log(error)
    );

    return () => unsub();
  }, []);

  // Fetch Archivos (Files) from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "files"),
      (snapshot) => {
        let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFileList(list);
      },
      (error) => console.log(error)
    );

    return () => unsub();
  }, []);

  // Fetch Fotos (Photos) from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "photos"),
      (snapshot) => {
        let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPhotoList(list);
      },
      (error) => console.log(error)
    );

    return () => unsub();
  }, []);

  // Set default selected video
  useEffect(() => {
    if (videoList.length > 0 && !selectedVideo) {
      setSelectedVideo(videoList[0]);
    }
  }, [videoList, selectedVideo]);

  // Función para eliminar un video
  const deleteVideo = async (videoId) => {
    try {
      await deleteDoc(doc(db, "videos", videoId));
      message.success("Video eliminado correctamente");
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(videoList[0] || null);
      }
    } catch (error) {
      console.error("Error al eliminar video:", error);
      message.error("Error al eliminar video");
    }
  };

  // Función para añadir un nuevo video
  const addVideo = async () => {
    if (!newVideoUrl) {
      message.error("Por favor ingresa la URL del video");
      return;
    }

    try {
      const videoData = {
        url: newVideoUrl,
        title: newVideoTitle || "Sin título",
        trainerId: myUid,
        timeStamp: serverTimestamp(),
      };
      await addDoc(collection(db, "videos"), videoData);
      message.success("Video añadido correctamente");
      setUploadVideoModalVisible(false);
      setNewVideoUrl("");
      setNewVideoTitle("");
    } catch (error) {
      console.error("Error al añadir video:", error);
      message.error("Error al añadir video");
    }
  };

  // Función para extraer la miniatura de YouTube
  const getYouTubeThumbnail = (url) => {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://img.youtube.com/vi/${match[2]}/0.jpg`;
    } else {
      return "https://via.placeholder.com/320x180.png?text=No+Thumbnail";
    }
  };

  // Función para seleccionar un video para reproducir
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  // Función para eliminar un archivo
  const deleteFile = async (fileId) => {
    try {
      await deleteDoc(doc(db, "files", fileId));
      message.success("Archivo eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      message.error("Error al eliminar archivo");
    }
  };

  // Función para eliminar una foto
  const deletePhoto = async (photoId) => {
    try {
      await deleteDoc(doc(db, "photos", photoId));
      message.success("Foto eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar foto:", error);
      message.error("Error al eliminar foto");
    }
  };

  // Props para subir archivos (Archivos Tab)
  const uploadFileProps = {
    name: "file",
    multiple: true,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const storageRef = ref(storage, `files/${myUid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Puedes implementar seguimiento de progreso aquí si lo deseas
          },
          (error) => {
            console.error("Error subiendo archivo:", error);
            message.error("Error al subir archivo");
            onError(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const fileData = {
              name: file.name,
              url: downloadURL,
              type: file.type,
              trainerId: myUid,
              timeStamp: serverTimestamp(),
            };
            await addDoc(collection(db, "files"), fileData);
            message.success(`${file.name} subido correctamente.`);
            onSuccess("ok");
          }
        );
      } catch (error) {
        console.error("Error subiendo archivo:", error);
        onError(error);
      }
    },
  };

  // Props para subir fotos (Fotos Tab)
  const uploadPhotoProps = {
    name: "file",
    multiple: true,
    accept: "image/*",
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const storageRef = ref(storage, `photos/${myUid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Puedes implementar seguimiento de progreso aquí si lo deseas
          },
          (error) => {
            console.error("Error subiendo foto:", error);
            message.error("Error al subir foto");
            onError(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const photoData = {
              name: file.name,
              url: downloadURL,
              trainerId: myUid,
              timeStamp: serverTimestamp(),
            };
            await addDoc(collection(db, "photos"), photoData);
            message.success(`${file.name} subido correctamente.`);
            onSuccess("ok");
          }
        );
      } catch (error) {
        console.error("Error subiendo foto:", error);
        onError(error);
      }
    },
  };

  // Función para mostrar íconos por tipo de archivo
  const getFileIcon = (type) => {
    if (type === "application/pdf") return <FaFilePdf size={64} color="#ff4d4f" />;
    if (type === "application/vnd.ms-excel" || type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      return <FaFileExcel size={64} color="#52c41a" />;
    if (type === "application/msword" || type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      return <FaFileWord size={64} color="#1890ff" />;
    return <FaFileAlt size={64} color="#1890ff" />;
  };

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Tabs defaultActiveKey="1">
        {/* Videos Tab */}
        <TabPane tab="Videos" key="1">
          <div className={styles.videosTab}>
            {/* Video Reel */}
            <div className={styles.videoReelContainer}>
              {/* Add Video Card */}
              <Card
                hoverable
                style={{
                  width: "100%",
                  marginBottom: 8,
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => setUploadVideoModalVisible(true)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 120,
                  }}
                >
                  <PlusOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                </div>
                <Meta title="Añadir Video" />
              </Card>
              {/* Video Cards */}
              {videoList.map((video) => (
                <Card
                  key={video.id}
                  hoverable
                  style={{ width: "100%", marginBottom: 8 }}
                  cover={
                    <Image
                      alt="thumbnail"
                      src={getYouTubeThumbnail(video.url)}
                      preview={false}
                      onClick={() => handleSelectVideo(video)}
                      style={{
                        cursor: "pointer",
                        height: 120,
                        objectFit: "cover",
                      }}
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<FaTrashAlt />}
                      onClick={() => deleteVideo(video.id)}
                      danger
                    />,
                  ]}
                >
                  <Meta
                    title={video.title || "Sin título"}
                    description={video.url}
                  />
                </Card>
              ))}
            </div>
            {/* Video Player */}
            <div className={styles.videoPlayerContainer}>
              {selectedVideo && (
                <div className={styles.videoPlayer}>
                  <h2>{selectedVideo.title}</h2>
                  <ReactPlayer
                    url={selectedVideo.url}
                    controls
                    width="100%"
                    height="360px"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Modal para Añadir Nuevo Video */}
          <Modal
            title="Añadir Nuevo Video"
            visible={uploadVideoModalVisible}
            onCancel={() => setUploadVideoModalVisible(false)}
            onOk={addVideo}
            okText="Añadir"
          >
            <Form layout="vertical">
              <Form.Item label="Título del Video">
                <Input
                  placeholder="Título del video"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="URL del Video">
                <Input
                  placeholder="Pega la URL del video aquí"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
        {/* Archivos Tab */}
        <TabPane tab="Archivos" key="2">
          <div className={styles.archivosTab}>
            {/* Drag and Drop Upload */}
            <Dragger {...uploadFileProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Haz clic o arrastra archivos a esta área para subir
              </p>
              <p className="ant-upload-hint">
                Soporte para subir uno o más archivos.
              </p>
            </Dragger>
            {/* Archivos Gallery */}
            <div className={styles.filesGallery}>
              {fileList.map((file) => (
                <Card
                  key={file.id}
                  hoverable
                  style={{ width: 200, margin: 8 }}
                  cover={
                    file.type && file.type.startsWith("image/") ? (
                      <img
                        alt={file.name}
                        src={file.url}
                        style={{ height: 120, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 120,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f0f2f5",
                        }}
                      >
                        {getFileIcon(file.type)}
                      </div>
                    )
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<FaTrashAlt />}
                      onClick={() => deleteFile(file.id)}
                      danger
                    />,
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <DownloadOutlined />
                    </a>,
                  ]}
                >
                  <Meta title={file.name || "Sin título"} />
                </Card>
              ))}
            </div>
          </div>
        </TabPane>

        {/* Fotos Tab */}
        <TabPane tab="Fotos" key="3">
          <div className={styles.fotosTab}>
            {/* Drag and Drop Upload */}
            <Dragger {...uploadPhotoProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Haz clic o arrastra fotos a esta área para subir
              </p>
              <p className="ant-upload-hint">
                Soporte para subir una o más fotos.
              </p>
            </Dragger>
            {/* Fotos Gallery */}
            <div className={styles.photosGallery}>
              {photoList.map((photo) => (
                <Card
                  key={photo.id}
                  hoverable
                  style={{ width: 200, margin: 8 }}
                  cover={
                    <Image
                      alt={photo.name}
                      src={photo.url}
                      style={{ height: 120, objectFit: "cover" }}
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<FaTrashAlt />}
                      onClick={() => deletePhoto(photo.id)}
                      danger
                    />,
                  ]}
                >
                  <Meta title={photo.name || "Sin título"} />
                </Card>
              ))}
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default withAuth(Files);
