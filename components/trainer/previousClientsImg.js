// components/trainer/PreviousClientsImg.js

import React, { useContext, useEffect, useState } from 'react';
import { Upload, Button, Card, List, Modal, Input, message } from 'antd';
import { UploadOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';
import {
  listenToSubcollection,
  deleteSubcollectionDocument,
  uploadFile,
  addSubcollectionDocument,
} from '../../services/firebase';

const PreviousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [fileBefore, setFileBefore] = useState(null);
  const [fileAfter, setFileAfter] = useState(null);
  const [clientName, setClientName] = useState('');
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!myUid) return;

    const unsub = listenToSubcollection(
      'trainers',
      myUid,
      'clientPhotos',
      [],
      (snapShot) => {
        const list = snapShot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPhotos(list);
      },
      (error) => console.error(error)
    );
    return () => unsub();
  }, [myUid]);

  const handleUpload = async (file, period) => {
    const filePath = `trainers/${myUid}/clientPhotos/${file.name}`;
    const downloadURL = await uploadFile(filePath, file);

    const photoData = {
      clientName,
      period,
      img: downloadURL,
      title: file.name,
    };

    await addSubcollectionDocument('trainers', myUid, 'clientPhotos', photoData);
  };

  const handleSubmit = async () => {
    if (!clientName || !fileBefore || !fileAfter) {
      message.error('Por favor, complete todos los campos.');
      return;
    }

    try {
      await handleUpload(fileBefore, 'before');
      await handleUpload(fileAfter, 'after');

      setClientName('');
      setFileBefore(null);
      setFileAfter(null);
      setModalVisible(false);
      message.success('Imágenes subidas correctamente.');
    } catch (error) {
      console.error('Error uploading images: ', error);
      message.error('Error al subir las imágenes.');
    }
  };

  const handleDeleteGroup = async (clientName) => {
    try {
      const photosToDelete = photos.filter(photo => photo.clientName === clientName);

      await Promise.all(
        photosToDelete.map(async (photo) => {
          await deleteSubcollectionDocument('trainers', myUid, 'clientPhotos', photo.id);
        })
      );

      message.success('Fotos eliminadas correctamente.');
    } catch (error) {
      console.error('Error deleting photos: ', error);
      message.error('Error al eliminar las fotos.');
    }
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
        <Input
          placeholder="Nombre del cliente"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Upload
          beforeUpload={(file) => {
            setFileBefore(file);
            return false;
          }}
          fileList={fileBefore ? [fileBefore] : []}
          listType="picture"
        >
          <Button icon={<UploadOutlined />}>Subir imagen "Antes"</Button>
        </Upload>
        <Upload
          beforeUpload={(file) => {
            setFileAfter(file);
            return false;
          }}
          fileList={fileAfter ? [fileAfter] : []}
          listType="picture"
          style={{ marginTop: 16 }}
        >
          <Button icon={<UploadOutlined />}>Subir imagen "Después"</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default PreviousClientsImg;
