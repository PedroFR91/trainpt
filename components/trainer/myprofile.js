import React, { useState, useEffect, useContext } from 'react';
import { Card, Avatar, Button, Upload, Modal, Input, Form, message } from 'antd';
import { UploadOutlined, EditOutlined } from '@ant-design/icons';
import { db, storage } from '../../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import styles from '../../styles/myprofile.module.css';

const MyProfile = () => {
  const { myData, myUid } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newName, setNewName] = useState(myData?.username || '');

  useEffect(() => {
    if (file) handleImageUpload();
  }, [file]);

  const handleImageUpload = async () => {
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => message.error('Error al subir la imagen'),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, 'users', myUid), { img: downloadURL });
          message.success('Imagen actualizada');
        });
      }
    );
  };

  const handleEditProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', myUid), { username: newName });
      message.success('Perfil actualizado');
      setIsEditModalOpen(false);
    } catch (error) {
      message.error('Error al actualizar el perfil');
    }
  };

  return (
    <div className={styles.myContainer}>
      {myData && (
        <Card
          actions={[
            <Button icon={<UploadOutlined />} onClick={() => document.getElementById('file-upload').click()}>
              Cambiar Imagen
            </Button>,
            <Button icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>
              Editar
            </Button>
          ]}
        >
          <Card.Meta
            avatar={<Avatar src={myData.img ? myData.img : '/face.jpg'} />}
            title={myData.username}
          />
          <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Modal
            title="Editar Perfil"
            visible={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={handleEditProfile}
          >
            <Form layout="vertical">
              <Form.Item label="Nombre">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      )}
    </div>
  );
};

export default MyProfile;
