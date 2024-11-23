// components/client/clientProfile.js
import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Card, Button, FloatButton, Upload, message, Modal, Input, Form } from 'antd';
import { EditOutlined, UploadOutlined, TeamOutlined } from '@ant-design/icons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../firebase.config';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import TrainersList from './trainersList';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/program.module.css';

const ClientProfile = () => {
  const { myData, myUid } = useContext(AuthContext);
  console.log(myData)
  const [file, setFile] = useState(null);
  const [isTrainersModalOpen, setIsTrainersModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [trainerData, setTrainerData] = useState(null);
  const [newName, setNewName] = useState(myData?.name || '');

  useEffect(() => {
    file && handleImageUpload();
  }, [file]);

  useEffect(() => {
    const fetchTrainerData = async () => {
      const subscriptionsRef = collection(db, 'subscriptions');
      const q = query(subscriptionsRef, where('clientId', '==', myUid), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const subscription = querySnapshot.docs[0].data();
        const trainerRef = doc(db, 'clients', subscription.trainerId);
        const trainerDoc = await getDoc(trainerRef);

        if (trainerDoc.exists()) {
          setTrainerData(trainerDoc.data());
        }
      }
    };

    fetchTrainerData();
  }, [myUid]);

  const handleImageUpload = async () => {
    if (!file) return;
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error(error);
        message.error('Error al subir la imagen');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, 'clients', myUid), { img: downloadURL });
          message.success('Imagen actualizada correctamente');
        });
      }
    );
  };

  const handleEditProfile = async () => {
    try {
      await updateDoc(doc(db, 'clients', myUid), { name: newName });
      message.success('Perfil actualizado correctamente');
      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error('Error actualizando el perfil:', error);
      message.error('Error al actualizar el perfil');
    }
  };

  const showTrainersModal = () => setIsTrainersModalOpen(true);
  const handleTrainersModalCancel = () => setIsTrainersModalOpen(false);

  const showEditProfileModal = () => setIsEditProfileModalOpen(true);
  const handleEditProfileModalCancel = () => setIsEditProfileModalOpen(false);

  return (
    <Card
      className={styles.profileCard}
      cover={
        <Avatar
          size={120}
          src={myData?.img ? myData.img : '/face.jpg'}
          style={{ margin: 'auto', display: 'block' }}
        />
      }
      actions={[
        <Button type="link" icon={<EditOutlined />} key="edit" onClick={showEditProfileModal}>
          Editar Perfil
        </Button>,
        <div className={styles.trainerContainer}>
          {trainerData ? (
            <>
              <Avatar src={myData.img || '/face.jpg'} size={40} />
              <span className={styles.trainerName}>{myData.username || 'Entrenador'}</span>
              <Button
                type="link"
                icon={<TeamOutlined />}
                className={styles.changeTrainerButton}
                onClick={showTrainersModal}
              >
                Cambiar Entrenador
              </Button>
            </>
          ) : (
            <Button
              type="link"
              icon={<TeamOutlined />}
              key="change-trainer"
              onClick={showTrainersModal}
            >
              Seleccionar Entrenador
            </Button>
          )}
        </div>
      ]}
      title="Mi Perfil" bordered={false} hoverable
    >
      <Card.Meta
        title={myData?.username || 'Nombre del Cliente'}
        description={myData?.email || 'Email del Cliente'}
      />
      <FloatButton
        icon={<UploadOutlined />}
        shape="circle"
        onClick={() => document.getElementById('file-upload').click()}
        tooltip={<div>Subir Nueva Foto</div>}
        style={{ right: 24, bottom: 24 }}
      />
      <input
        type="file"
        id="file-upload"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {/* Modal para seleccionar el entrenador */}
      <Modal
        title="Selecciona tu Entrenador"
        visible={isTrainersModalOpen}
        onCancel={handleTrainersModalCancel}
        footer={null}
      >
        <TrainersList />
      </Modal>

      {/* Modal para editar el perfil */}
      <Modal
        title="Editar Perfil"
        visible={isEditProfileModalOpen}
        onCancel={handleEditProfileModalCancel}
        footer={[
          <Button key="cancel" onClick={handleEditProfileModalCancel}>
            Cancelar
          </Button>,
          <Button key="save" type="primary" onClick={handleEditProfile}>
            Guardar Cambios
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Nombre">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Introduce tu nombre"
            />
          </Form.Item>
          <Form.Item label="Foto de Perfil">
            <Upload
              beforeUpload={(file) => {
                setFile(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Subir Nueva Foto</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ClientProfile;
