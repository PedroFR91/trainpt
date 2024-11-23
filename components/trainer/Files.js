import React, { useEffect, useState, useContext } from "react";
import styles from "../../styles/files.module.css";
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
import ReactPlayer from "react-player";
import AuthContext from "../../context/AuthContext";
import {
    addSubcollectionDocument,
    deleteSubcollectionDocument,
    listenToSubcollection,
    uploadFile,
} from '../../services/firebase';

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

    // Estados para Archivos y Fotos
    const [fileList, setFileList] = useState([]);
    const [photoList, setPhotoList] = useState([]);

    // Cargar Videos
    useEffect(() => {
        if (!myUid) return;

        const unsub = listenToSubcollection(
            'trainers',
            myUid,
            'videos',
            [],
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setVideoList(list);
                if (list.length > 0 && selectedVideo === null) {
                    setSelectedVideo(list[0]);
                }
            },
            (error) => console.log(error)
        );
        return () => unsub();
    }, [myUid]);

    // Actualizar `selectedVideo` cuando cambian los videos
    useEffect(() => {
        if (videoList.length > 0 && !selectedVideo) {
            setSelectedVideo(videoList[0]);
        } else if (videoList.length === 0) {
            setSelectedVideo(null);
        }
    }, [videoList]);

    // Cargar Archivos y Fotos
    useEffect(() => {
        if (!myUid) return;

        const unsubFiles = listenToSubcollection(
            'trainers',
            myUid,
            'files',
            [],
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setFileList(list);
            },
            (error) => console.log(error)
        );

        const unsubPhotos = listenToSubcollection(
            'trainers',
            myUid,
            'photos',
            [],
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setPhotoList(list);
            },
            (error) => console.log(error)
        );

        return () => {
            unsubFiles();
            unsubPhotos();
        };
    }, [myUid]);

    // Función para eliminar videos, archivos y fotos
    const deleteVideo = async (videoId) => {
        try {
            await deleteSubcollectionDocument('trainers', myUid, 'videos', videoId);
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
            await deleteSubcollectionDocument('trainers', myUid, 'files', fileId);
            message.success("Archivo eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            message.error("Error al eliminar archivo");
        }
    };

    const deletePhoto = async (photoId) => {
        try {
            await deleteSubcollectionDocument('trainers', myUid, 'photos', photoId);
            message.success("Foto eliminada correctamente");
        } catch (error) {
            console.error("Error al eliminar foto:", error);
            message.error("Error al eliminar foto");
        }
    };

    // Función para añadir videos
    const addVideo = async () => {
        if (!newVideoUrl || !ReactPlayer.canPlay(newVideoUrl)) {
            message.error("Por favor ingresa una URL de video válida");
            return;
        }

        try {
            const videoData = {
                url: newVideoUrl,
                title: newVideoTitle || "Sin título",
            };
            await addSubcollectionDocument('trainers', myUid, 'videos', videoData);
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
                const filePath = `trainers/${myUid}/files/${file.name}`;
                const downloadURL = await uploadFile(filePath, file);
                const fileData = {
                    name: file.name,
                    url: downloadURL,
                    type: file.type,
                };
                await addSubcollectionDocument('trainers', myUid, 'files', fileData);
                message.success(`${file.name} subido correctamente.`);
                onSuccess("ok");
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
                const filePath = `trainers/${myUid}/photos/${file.name}`;
                const downloadURL = await uploadFile(filePath, file);
                const photoData = {
                    name: file.name,
                    url: downloadURL,
                };
                await addSubcollectionDocument('trainers', myUid, 'photos', photoData);
                message.success(`${file.name} subido correctamente.`);
                onSuccess("ok");
            } catch (error) {
                console.error("Error subiendo foto:", error);
                onError(error);
            }
        },
    };

    // Función para obtener el icono según el tipo de archivo
    const getFileIcon = (type) => {
        if (type === "application/pdf") return <FaFilePdf size={64} color="#ff4d4f" />;
        if (type.startsWith("application/vnd.ms-excel")) return <FaFileExcel size={64} color="#52c41a" />;
        if (type.startsWith("application/msword")) return <FaFileWord size={64} color="#1890ff" />;
        return <FaFileAlt size={64} color="#1890ff" />;
    };

    return (
        <div className={styles.filesContainer}>
            <Tabs defaultActiveKey="1">
                {/* Pestaña de Videos */}
                <TabPane tab={<span><VideoCameraOutlined /> Videos</span>} key="1">
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
                                        className={selectedVideo?.id === video.id ? styles.selectedItem : ""}
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
                                        key={selectedVideo.url}  // Clave única para forzar actualización
                                        url={selectedVideo.url}
                                        controls
                                        width="100%"
                                        height="360px"
                                        playing  // Inicia la reproducción automáticamente
                                    />
                                </Card>
                            ) : (
                                <Card><p>Selecciona un video para reproducirlo</p></Card>
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
                <TabPane tab={<span><FileOutlined /> Archivos</span>} key="2">
                    <Dragger {...uploadFileProps} style={{ marginBottom: 16 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Haz clic o arrastra archivos para subir</p>
                    </Dragger>
                    <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={fileList}
                        renderItem={(file) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    cover={<div className={styles.fileIcon}>{getFileIcon(file.type)}</div>}
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
                <TabPane tab={<span><PictureOutlined /> Fotos</span>} key="3">
                    <Dragger {...uploadPhotoProps} style={{ marginBottom: 16 }}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Haz clic o arrastra fotos para subir</p>
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
