// components/trainer/Files.js

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
    List,
    Tooltip,
    Row,
    Col,
} from "antd";
import {
    UploadOutlined,
    PlusOutlined,
    InboxOutlined,
    DownloadOutlined,
    DeleteOutlined,
    VideoCameraOutlined,
    FileOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import {
    FaFilePdf,
    FaFileExcel,
    FaFileWord,
    FaFileAlt,
} from "react-icons/fa";
import ReactPlayer from "react-player"; // Asegúrate de tener instalado react-player
import AuthContext from "../../context/AuthContext";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const { Meta } = Card;
const { Dragger } = Upload;
const { TabPane } = Tabs;
const { TextArea } = Input;

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

    // Cargar Videos
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "videos"),
            (snapshot) => {
                let list = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((video) => video.trainerId === myUid);
                setVideoList(list);
                // Solo establecer selectedVideo si no hay uno seleccionado
                if (list.length > 0 && selectedVideo === null) {
                    setSelectedVideo(list[0]);
                }
            },
            (error) => console.log(error)
        );
        return () => unsub();
    }, [myUid]);

    // Asegurarse de que selectedVideo siempre esté actualizado
    useEffect(() => {
        if (videoList.length > 0 && selectedVideo === null) {
            setSelectedVideo(videoList[0]);
        } else if (videoList.length === 0) {
            setSelectedVideo(null);
        }
    }, [videoList]);

    // Cargar Archivos
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "files"),
            (snapshot) => {
                let list = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((file) => file.trainerId === myUid);
                setFileList(list);
            },
            (error) => console.log(error)
        );
        return () => unsub();
    }, [myUid]);

    // Cargar Fotos
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "photos"),
            (snapshot) => {
                let list = snapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((photo) => photo.trainerId === myUid);
                setPhotoList(list);
            },
            (error) => console.log(error)
        );
        return () => unsub();
    }, [myUid]);

    // Funciones para eliminar elementos
    const deleteVideo = async (videoId) => {
        try {
            await deleteDoc(doc(db, "videos", videoId));
            message.success("Video eliminado correctamente");
            if (selectedVideo && selectedVideo.id === videoId) {
                setSelectedVideo(null);
            }
        } catch (error) {
            console.error("Error al eliminar video:", error);
            message.error("Error al eliminar video");
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

    // Funciones para añadir elementos
    const addVideo = async () => {
        if (!newVideoUrl || !ReactPlayer.canPlay(newVideoUrl)) {
            message.error("Por favor ingresa una URL de video válida");
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

    // Props para subir archivos y fotos
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

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (type) => {
        if (type === "application/pdf")
            return <FaFilePdf size={64} color="#ff4d4f" />;
        if (
            type.startsWith("application/vnd.ms-excel") ||
            type.startsWith(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        )
            return <FaFileExcel size={64} color="#52c41a" />;
        if (
            type.startsWith("application/msword") ||
            type.startsWith(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
        )
            return <FaFileWord size={64} color="#1890ff" />;
        return <FaFileAlt size={64} color="#1890ff" />;
    };

    return (
        <div className={styles.filesContainer}>
            <Tabs defaultActiveKey="1">
                {/* Pestaña de Videos */}
                <TabPane
                    tab={
                        <span>
                            <VideoCameraOutlined />
                            Videos
                        </span>
                    }
                    key="1"
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setUploadVideoModalVisible(true)}
                                style={{ marginBottom: 16 }}
                            >
                                Añadir Video
                            </Button>
                            <List
                                itemLayout="horizontal"
                                dataSource={videoList}
                                renderItem={(video) => (
                                    <List.Item
                                        actions={[
                                            <Tooltip title="Eliminar">
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined />}
                                                    danger
                                                    onClick={() => deleteVideo(video.id)}
                                                />
                                            </Tooltip>,
                                        ]}
                                        onClick={() => setSelectedVideo(video)}
                                        className={
                                            selectedVideo && selectedVideo.id === video.id
                                                ? styles.selectedItem
                                                : ""
                                        }
                                    >
                                        <List.Item.Meta
                                            avatar={<VideoCameraOutlined style={{ fontSize: 24 }} />}
                                            title={video.title || "Sin título"}
                                            description={video.url}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            {selectedVideo ? (
                                <Card title={selectedVideo.title || "Sin título"}>
                                    <ReactPlayer
                                        key={selectedVideo.url}
                                        url={selectedVideo.url}
                                        controls
                                        width="100%"
                                        height="360px"
                                    />
                                </Card>
                            ) : (
                                <Card>
                                    <p>Selecciona un video para reproducirlo</p>
                                </Card>
                            )}
                        </Col>
                    </Row>

                    <Modal
                        title="Añadir Video"
                        visible={uploadVideoModalVisible}
                        onCancel={() => setUploadVideoModalVisible(false)}
                        onOk={addVideo}
                        okText="Añadir"
                        cancelText="Cancelar"
                    >
                        <Form layout="vertical">
                            <Form.Item label="Título">
                                <Input
                                    value={newVideoTitle}
                                    onChange={(e) => setNewVideoTitle(e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item label="URL del Video">
                                <Input
                                    value={newVideoUrl}
                                    onChange={(e) => setNewVideoUrl(e.target.value)}
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </TabPane>

                {/* Pestaña de Archivos */}
                <TabPane
                    tab={
                        <span>
                            <FileOutlined />
                            Archivos
                        </span>
                    }
                    key="2"
                >
                    <Dragger {...uploadFileProps} style={{ marginBottom: 16 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Haz clic o arrastra archivos para subir
                        </p>
                    </Dragger>
                    <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={fileList}
                        renderItem={(file) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    cover={
                                        <div className={styles.fileIcon}>
                                            {getFileIcon(file.type)}
                                        </div>
                                    }
                                    actions={[
                                        <Tooltip title="Eliminar">
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                danger
                                                onClick={() => deleteFile(file.id)}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="Descargar">
                                            <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        </Tooltip>,
                                    ]}
                                >
                                    <Meta title={file.name} />
                                </Card>
                            </List.Item>
                        )}
                    />
                </TabPane>

                {/* Pestaña de Fotos */}
                <TabPane
                    tab={
                        <span>
                            <PictureOutlined />
                            Fotos
                        </span>
                    }
                    key="3"
                >
                    <Dragger {...uploadPhotoProps} style={{ marginBottom: 16 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Haz clic o arrastra fotos para subir
                        </p>
                    </Dragger>
                    <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={photoList}
                        renderItem={(photo) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    cover={<Image src={photo.url} alt={photo.name} />}
                                    actions={[
                                        <Tooltip title="Eliminar">
                                            <Button
                                                type="text"
                                                icon={<DeleteOutlined />}
                                                danger
                                                onClick={() => deletePhoto(photo.id)}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="Descargar">
                                            <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                href={photo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            />
                                        </Tooltip>,
                                    ]}
                                >
                                    <Meta title={photo.name} />
                                </Card>
                            </List.Item>
                        )}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Files;
