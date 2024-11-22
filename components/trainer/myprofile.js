// components/trainer/MyProfile.js

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Card, Avatar, Button, Modal, Form, message, Upload, Rate, List } from 'antd';
import {
  UploadOutlined,
  EditOutlined,
  LikeOutlined,
  StarOutlined,
  MessageOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { initialValue } from './initialValue';
import Toolbar from './Toolbar';
import { serialize, deserialize } from './utils';
import { updateDocument, uploadFile, getDocument } from '../../services/firebase';
import styles from '../../styles/myprofile.module.css';

const MyProfile = () => {
  const { myData, myUid, setMyData } = useContext(AuthContext);
  const [profileFile, setProfileFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editorValue, setEditorValue] = useState(initialValue);
  const [background, setBackground] = useState(myData?.background || '');
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [loading, setLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    setBackground(myData?.background || '');
    fetchTrainerData();
  }, [myData]);

  const fetchTrainerData = async () => {
    const trainerDoc = await getDocument('trainers', myUid);
    if (trainerDoc) {
      const likes = trainerDoc.likes ? trainerDoc.likes.length : 0;
      const ratings = trainerDoc.ratings || [];
      const average =
        ratings.length > 0
          ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
          : 0;
      setLikesCount(likes);
      setAverageRating(average);
      setComments(trainerDoc.comments || []);
    }
  };

  const handleImageUpload = async (file, field) => {
    try {
      const filePath = `${field}/${myUid}/${file.name}`;
      const downloadURL = await uploadFile(filePath, file);
      await updateDocument('trainers', myUid, { [field]: downloadURL });
      message.success('Imagen actualizada');
      if (setMyData) {
        setMyData((prevData) => ({ ...prevData, [field]: downloadURL }));
      }
    } catch (error) {
      message.error('Error al subir la imagen');
    }
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      const updatedBio = serialize(editorValue);
      await updateDocument('trainers', myUid, { bio: updatedBio });
      message.success('Perfil actualizado');
      setIsEditModalOpen(false);
      if (setMyData) {
        setMyData((prevData) => ({ ...prevData, bio: updatedBio }));
      }
    } catch (error) {
      message.error('Error al actualizar el perfil');
    }
    setLoading(false);
  };

  const handleBackgroundChange = async (file) => {
    if (file) {
      await handleImageUpload(file, 'background');
    }
  };

  const openEditModal = () => {
    setEditorValue(deserialize(myData?.bio || ''));
    setIsEditModalOpen(true);
  };

  const beforeUploadProfile = (file) => {
    setProfileFile(file);
    return false; // Evita la subida automática
  };

  const handleProfileUpload = async () => {
    if (profileFile) {
      await handleImageUpload(profileFile, 'img');
      setProfileFile(null);
    }
  };

  const publicProfileUrl = `${window.location.origin}/trainer/${myUid}`;

  return (
    <div className={styles.profileContainer}>
      {myData && (
        <Card className={styles.profileCard} hoverable>
          <div
            className={styles.coverContainer}
            style={{ backgroundImage: `url(${background})` }}
          >
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handleBackgroundChange(file);
                return false;
              }}
            >
              <Button
                className={styles.coverUploadButton}
                icon={<UploadOutlined />}
                shape="circle"
              />
            </Upload>
          </div>
          <div className={styles.contentContainer}>
            <Avatar size={100} src={myData.img ? myData.img : '/face.jpg'} />
            <h2 className={styles.username}>{myData.username}</h2>
            <Upload
              beforeUpload={beforeUploadProfile}
              showUploadList={false}
              onChange={handleProfileUpload}
            >
              <Button icon={<UploadOutlined />}>Cambiar Imagen</Button>
            </Upload>
            <Button icon={<EditOutlined />} onClick={openEditModal}>
              Editar Información
            </Button>
            {/* Mostrar likes, ratings y comentarios */}
            <div className={styles.socialStats}>
              <div>
                <LikeOutlined /> {likesCount} Me gusta
              </div>
              <div>
                <StarOutlined /> {averageRating} Valoración promedio
              </div>
            </div>
            <div className={styles.commentsSection}>
              <h3>Comentarios de los clientes</h3>
              {comments.length > 0 ? (
                <List
                  dataSource={comments}
                  renderItem={(item, index) => (
                    <List.Item key={index}>
                      <MessageOutlined /> {item.comment}
                    </List.Item>
                  )}
                />
              ) : (
                <p>No hay comentarios aún.</p>
              )}
            </div>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(publicProfileUrl);
                message.success('URL del perfil público copiada al portapapeles');
              }}
              style={{ marginTop: 10 }}
            >
              Copiar URL del Perfil Público
            </Button>
          </div>
          <Modal
            title="Editar Perfil"
            visible={isEditModalOpen}
            onCancel={() => setIsEditModalOpen(false)}
            onOk={handleEditProfile}
            confirmLoading={loading}
            width={800}
          >
            <Form layout="vertical">
              <Form.Item label="Información">
                <Slate
                  editor={editor}
                  value={editorValue}
                  onChange={(value) => setEditorValue(value)}
                >
                  <Toolbar />
                  <Editable
                    renderElement={(props) => <p {...props.attributes}>{props.children}</p>}
                    placeholder="Escribe tu información aquí..."
                  />
                </Slate>
              </Form.Item>
            </Form>
          </Modal>
        </Card>
      )}
    </div>
  );
};

export default MyProfile;
