import React, { useContext, useEffect, useState } from 'react';
import { Upload, Button, Card, Select, Modal, Input, message, Carousel } from 'antd';
import { UploadOutlined, DeleteOutlined, ShareAltOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';
import {
  listenToSubcollection,
  deleteSubcollectionDocument,
  uploadFile,
  addSubcollectionDocument,
} from '../../services/firebase';

const { Option } = Select;

const PreviousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [fileBefore, setFileBefore] = useState(null);
  const [fileAfter, setFileAfter] = useState(null);
  const [clientName, setClientName] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
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

  const uniqueClients = Array.from(new Set(photos.map(photo => photo.clientName)));

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

      {/* Selector para elegir cliente */}
      <Select
        style={{ width: '100%', marginBottom: 16 }}
        placeholder="Selecciona un cliente"
        onChange={setSelectedClient}
        value={selectedClient}
        optionLabelProp="label"
      >
        {uniqueClients.map((client) => {
          const clientPhoto = photos.find(photo => photo.clientName === client);
          return (
            <Option key={client} value={client} label={client}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {clientPhoto?.img && (
                  <img
                    src={clientPhoto.img}
                    alt={client}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                )}
                <span>{client}</span>
              </div>
            </Option>
          );
        })}
      </Select>

      {/* Renderiza el carrusel del cliente seleccionado */}
      {selectedClient && (
        <Card title={selectedClient} className={styles.clientCard}>
          <Carousel
            dots
            arrows
            autoplay
            style={{ margin: '0 auto', maxWidth: '400px' }}
          >
            {photos
              .filter(photo => photo.clientName === selectedClient)
              .map(photo => (
                <div key={photo.id} className={styles.clientImgWrapper}>
                  <img
                    src={photo.img}
                    alt={photo.title}
                    className={styles.clientImg}
                    style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '10px' }}
                  />
                  <div className={styles.imgTitle}>{photo.title}</div>
                </div>
              ))}
          </Carousel>
          <div className={styles.imgActions} style={{ textAlign: 'center', marginTop: '16px' }}>
            {photos
              .filter(photo => photo.clientName === selectedClient)
              .map(photo => (
                <Button
                  key={photo.id}
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShare(photo)}
                  style={{ marginRight: '8px' }}
                >
                  Compartir
                </Button>
              ))}
          </div>
        </Card>
      )}

      {/* Modal para subir imágenes */}
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
