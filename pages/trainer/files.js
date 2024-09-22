import React, { useEffect, useState } from "react";
import styles from "../../styles/files.module.css";
import TrainerHeader from "../../components/trainer/trainerHeader";
import { db, storage } from "../../firebase.config";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ReactPlayer from "react-player";
import { InboxOutlined } from '@ant-design/icons';
import { Upload, message, Card, Image, Space, Skeleton, Button, Input, List } from 'antd';
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";
import withAuth from '../../components/withAuth';

const { Dragger } = Upload;
const { Meta } = Card;

const Files = () => {
  const [file, setFile] = useState(null);
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
  const [clients, setClients] = useState([]);
  const [showClient, setShowClient] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    setData({ ...data, role: "trainer" });
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "videos"), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setVideoList(list);
    }, (error) => {
      console.log(error);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "files"), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setMyFiles(list);
    }, (error) => {
      console.log(error);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (videoList.length > 0) {
      setUrl(videoList[0].url);
    }
  }, [videoList]);

  useEffect(() => {
    if (data) {
      const q = query(collection(db, "users"));
      const unsub = onSnapshot(q, (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setClients(list);
      });
      return () => {
        unsub();
      };
    }
  }, [data]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const name = new Date().getTime() + file.name;
    try {
      await addDoc(collection(db, "files"), {
        ...data,
        fileType: file.type,
        title: fileTitle,
        size: file.size,
        trainerId: user.uid,
        timeStamp: serverTimestamp(),
      });
      message.success(`${file.name} file uploaded successfully.`);
    } catch (error) {
      console.log(error);
      message.error(`${file.name} file upload failed.`);
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
      await getDoc(videoDocRef);
      if (!videoList.some((video) => video.url === videoData.url)) {
        setVideoList((prevState) => [
          ...prevState,
          { id: videoDocRef.id, title: videoTitle, url },
        ]);
      }
      message.success(`${videoTitle} video added successfully.`);
    } catch (error) {
      console.log(error);
      message.error(`${videoTitle} video upload failed.`);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      setVideoList((prevState) => prevState.filter((video) => video.id !== videoId));
      await deleteDoc(doc(db, "videos", videoId));
      message.success(`Video deleted successfully.`);
      if (url === videoList.find((video) => video.id === videoId).url) {
        setUrl("");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      message.error(`Failed to delete video.`);
    }
  };

  const deleteFile = async (fileId) => {
    try {
      setMyFiles((prevState) => prevState.filter((file) => file.id !== fileId));
      await deleteDoc(doc(db, "files", fileId));
      message.success(`File deleted successfully.`);
    } catch (error) {
      console.error("Error deleting file:", error);
      message.error(`Failed to delete file.`);
    }
  };

  const selectVideo = (url) => {
    setUrl(url);
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        setFile(file);
        onSuccess("ok");
      }, 0);
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div className={styles.container}>
      <TrainerHeader />

      <div className={styles.uploadSection}>
        <div className={styles.videoUpload}>
          <h2>Upload Video</h2>
          <Input
            placeholder="Video Title"
            onChange={(e) => setVideoTitle(e.target.value)}
          />
          <Input
            placeholder="Paste URL here"
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={addVideo}>Upload Video</Button>
          <div className={styles.videoPlayer}>
            <ReactPlayer url={url} width={"100%"} />
          </div>
        </div>
        <div className={styles.videoList}>
          <h2>Available Videos</h2>
          <List
            dataSource={videoList}
            renderItem={(video) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<FaTrashAlt />}
                    onClick={() => deleteVideo(video.id)}
                  />
                ]}
                onClick={() => selectVideo(video.url)}
              >
                {video.title ? video.title : "Untitled"}
              </List.Item>
            )}
          />
        </div>
      </div>

      <div className={styles.uploadFiles}>
        <h2>Upload Files</h2>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
          </p>
        </Dragger>
      </div>

      <div className={styles.gallery}>
        <h2>My Gallery</h2>
        <Space wrap>
          {myfiles.length > 0 ? (
            myfiles.map((item) => (
              <Card
                key={item.id}
                hoverable
                cover={item.fileType.startsWith('image') ? <img src={item.img} alt={item.title} /> : <FaFilePdf size={100} />}
                actions={[
                  <a href={item.img} target="_blank" rel="noopener noreferrer">View/Download</a>,
                  <FaTrashAlt size={20} onClick={() => deleteFile(item.id)} />
                ]}
              >
                <Meta title={item.title ? item.title : "Untitled"} />
              </Card>
            ))
          ) : (
            <Skeleton active />
          )}
        </Space>
      </div>
    </div>
  );
};

export default withAuth(Files);
