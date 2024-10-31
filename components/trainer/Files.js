import React, { useEffect, useState, useContext } from "react";
import styles from "../../styles/files.module.css";
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

    useEffect(() => {
        if (videoList.length > 0 && !selectedVideo) {
            setSelectedVideo(videoList[0]);
        }
    }, [videoList, selectedVideo]);

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

    const deleteFile = async (fileId) => {
        try {
            await deleteDoc(doc(db, "files", fileId));
            message.success("Archivo eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            message.error("Error al eliminar archivo");
        }
    };

    const deletePhoto = async (photoId) => {
        try {
            await deleteDoc(doc(db, "photos", photoId));
            message.success("Foto eliminada correctamente");
        } catch (error) {
            console.error("Error al eliminar foto:", error);
            message.error("Error al eliminar foto");
        }
    };

    const uploadFileProps = {
        name: "file",
        multiple: true,
        customRequest: async ({ file, onSuccess, onError }) => {
            try {
                const storageRef = ref(storage, `files/${myUid}/${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    "state_changed",
                    () => { },
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
                    () => { },
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

    const getFileIcon = (type) => {
        if (type === "application/pdf") return <FaFilePdf size={64} color="#ff4d4f" />;
        if (type.startsWith("application/vnd.ms-excel") || type.startsWith("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            return <FaFileExcel size={64} color="#52c41a" />;
        if (type.startsWith("application/msword") || type.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
            return <FaFileWord size={64} color="#1890ff" />;
        return <FaFileAlt size={64} color="#1890ff" />;
    };

    return (
        <Tabs defaultActiveKey="1">
            <TabPane tab="Videos" key="1">
                <div className={styles.videosTab}>
                    <Card
                        hoverable
                        style={{ width: "100%", marginBottom: 8, textAlign: "center" }}
                        onClick={() => setUploadVideoModalVisible(true)}
                    >
                        <PlusOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                        <Meta title="Añadir Video" />
                    </Card>
                    {videoList.map((video) => (
                        <Card
                            key={video.id}
                            hoverable
                            style={{ width: "100%", marginBottom: 8 }}
                            cover={
                                <Image
                                    alt="thumbnail"
                                    src={video.url}  // Puedes utilizar una función para obtener la miniatura
                                    preview={false}
                                    onClick={() => setSelectedVideo(video)}
                                    style={{ height: 120, objectFit: "cover" }}
                                />
                            }
                            actions={[<Button icon={<FaTrashAlt />} onClick={() => deleteVideo(video.id)} danger />]}
                        >
                            <Meta title={video.title || "Sin título"} description={video.url} />
                        </Card>
                    ))}
                    {selectedVideo && (
                        <div className={styles.videoPlayer}>
                            <h2>{selectedVideo.title}</h2>
                            <ReactPlayer url={selectedVideo.url} controls width="100%" height="360px" />
                        </div>
                    )}
                </div>
            </TabPane>
            <TabPane tab="Archivos" key="2">
                <Dragger {...uploadFileProps}>
                    <InboxOutlined />
                    <p>Haz clic o arrastra archivos para subir</p>
                </Dragger>
                {fileList.map((file) => (
                    <Card key={file.id} cover={getFileIcon(file.type)}>
                        <Meta title={file.name} />
                        <Button icon={<FaTrashAlt />} onClick={() => deleteFile(file.id)} danger />
                        <a href={file.url} target="_blank" rel="noopener noreferrer"><DownloadOutlined /></a>
                    </Card>
                ))}
            </TabPane>
            <TabPane tab="Fotos" key="3">
                <Dragger {...uploadPhotoProps}>
                    <InboxOutlined />
                    <p>Haz clic o arrastra fotos para subir</p>
                </Dragger>
                {photoList.map((photo) => (
                    <Card key={photo.id} cover={<Image src={photo.url} alt={photo.name} />}>
                        <Meta title={photo.name} />
                        <Button icon={<FaTrashAlt />} onClick={() => deletePhoto(photo.id)} danger />
                    </Card>
                ))}
            </TabPane>
        </Tabs>
    );
};

export default Files;
