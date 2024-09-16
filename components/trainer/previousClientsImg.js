import React, { useContext, useEffect, useState } from 'react';
import { Upload, Button, Card, List, Modal, Input, message } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { doc, setDoc, serverTimestamp, onSnapshot, collection, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';

const PreviousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [fileBefore, setFileBefore] = useState(null);
  const [fileAfter, setFileAfter] = useState(null);
  const [clientName, setClientName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'clientPhotos'),
      (snapShot) => {
        const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPhotos(list.filter(photo => photo.trainerId === myUid));
      },
      (error) => console.error(error)
    );
    return () => unsub();
  }, [myUid]);

  const handleUpload = async (file, period) => {
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    await uploadTask;
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

    const photoData = {
      trainerId: myUid,
      clientName,
      period,
      img: downloadURL,
      title: file.name,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(collection(db, 'clientPhotos')), photoData);
  };

  const handleSubmit = async () => {
    if (!clientName || !fileBefore || !fileAfter) {
      message.error('Por favor, complete todos los campos.');
      return;
    }

    await handleUpload(fileBefore, 'before');
    await handleUpload(fileAfter, 'after');

    setClientName('');
    setFileBefore(null);
    setFileAfter(null);
    setModalVisible(false);
  };

  const handleDeleteGroup = async (client) => {
    const photosToDelete = photos.filter(photo => photo.clientName === client);

    await Promise.all(
      photosToDelete.map(async (photo) => {
        await deleteDoc(doc(db, 'clientPhotos', photo.id));
      })
    );
  };

  const handleShare = (photo) => {
    navigator.clipboard.writeText(photo.img);
    message.success('URL de la imagen copiada al portapapeles');
  };

  return (
    <div className={styles.container}>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Subir imágenes de clientes
      </Button>
      <List
        itemLayout="vertical"
        dataSource={Array.from(new Set(photos.map(photo => photo.clientName)))}
        renderItem={client => (
          <List.Item
            key={client}
            actions={[
              <Button icon={<DeleteOutlined />} onClick={() => handleDeleteGroup(client)} />
            ]}
          >
            <Card title={client} className={styles.clientCard}>
              <div className={styles.clientImgGroup}>
                {photos
                  .filter(photo => photo.clientName === client)
                  .map(photo => (
                    <div key={photo.id} className={styles.clientImgWrapper}>
                      <img src={photo.img} alt={photo.title} className={styles.clientImg} />
                      <div className={styles.imgTitle}>{photo.title}</div>
                      <div className={styles.imgActions}>
                        <Button icon={<ShareAltOutlined />} onClick={() => handleShare(photo)} />
                        <Button icon={<EditOutlined />} />
                        <Button icon={<DeleteOutlined />} onClick={() => handleDeleteGroup(photo.clientName)} />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </List.Item>
        )}
      />
      <Modal
        title="Subir imágenes de clientes"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
      >
        <Upload
          beforeUpload={(file) => {
            setFileBefore(file);
            return false;
          }}
          fileList={fileBefore ? [fileBefore] : []}
        >
          <Button icon={<UploadOutlined />}>Subir imagen antes</Button>
        </Upload>
        <Upload
          beforeUpload={(file) => {
            setFileAfter(file);
            return false;
          }}
          fileList={fileAfter ? [fileAfter] : []}
        >
          <Button icon={<UploadOutlined />}>Subir imagen después</Button>
        </Upload>
        <Input
          placeholder="Nombre del cliente"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default PreviousClientsImg;
