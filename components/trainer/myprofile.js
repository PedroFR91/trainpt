import React, { useState, useContext, useMemo, useCallback } from 'react';
import { Card, Avatar, Button, Modal, Form, message } from 'antd';
import { UploadOutlined, EditOutlined } from '@ant-design/icons';
import { db, storage } from '../../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import styles from '../../styles/myprofile.module.css';
import { Slate, Editable, withReact } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { initialValue } from './initialValue';
import Toolbar from './Toolbar';
import { serialize, deserialize } from './utils';

const MyProfile = () => {
  const { myData, myUid, setMyData } = useContext(AuthContext);
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editorValue, setEditorValue] = useState(initialValue);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const displayEditor = useMemo(() => withReact(createEditor()), []);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file, field) => {
    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      null,
      (error) => message.error('Error al subir la imagen'),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, 'users', myUid), { [field]: downloadURL });
          message.success('Imagen actualizada');
          if (setMyData) {
            setMyData(prevData => ({ ...prevData, [field]: downloadURL }));
          }
        });
      }
    );
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      const updatedBio = serialize(editorValue);
      await updateDoc(doc(db, 'users', myUid), { bio: updatedBio });
      message.success('Perfil actualizado');
      setIsEditModalOpen(false);
      if (setMyData) {
        setMyData(prevData => ({ ...prevData, bio: updatedBio }));
      }
    } catch (error) {
      message.error('Error al actualizar el perfil');
    }
    setLoading(false);
  };

  const renderElement = useCallback((props) => {
    const { element, attributes, children } = props;
    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    const { leaf, attributes, children } = props;
    let formattedText = children;

    if (leaf.bold) formattedText = <strong>{formattedText}</strong>;
    if (leaf.italic) formattedText = <em>{formattedText}</em>;
    if (leaf.underline) formattedText = <u>{formattedText}</u>;
    if (leaf.strikethrough) formattedText = <del>{formattedText}</del>;
    if (leaf.code) formattedText = <code>{formattedText}</code>;

    return <span {...attributes}>{formattedText}</span>;
  }, []);

  const openEditModal = () => {
    setEditorValue(deserialize(myData?.bio || ''));
    setIsEditModalOpen(true);
  };

  return (
    <div className={styles.myContainer}>
      {myData && (
        <Card className={styles.profileCardSidebar}>
          <Avatar size={100} src={myData.img ? myData.img : '/face.jpg'} />
          <h2 className={styles.username}>{myData.username}</h2>
          <p className={styles.bio}>{myData.bio || 'Sin información'}</p>
          <Button icon={<EditOutlined />} onClick={openEditModal}>Editar</Button>
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
                <Slate editor={editor} value={editorValue} onChange={(value) => setEditorValue(value)}>
                  <Toolbar />
                  <Editable renderElement={renderElement} renderLeaf={renderLeaf} placeholder="Escribe tu información aquí..." />
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
