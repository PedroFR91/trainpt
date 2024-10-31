import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Card, Button, Modal, Input, Form, Upload, message } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/program.module.css';

const TrainerProfile = ({ myUid }) => {
    const { myData } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [newName, setNewName] = useState(myData?.name || '');

    useEffect(() => {
        file && handleImageUpload();
    }, [file]);

    const handleImageUpload = async () => {
        if (!file) return;
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error(error);
                message.error('Error al subir la imagen');
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    await updateDoc(doc(db, 'users', myUid), { img: downloadURL });
                    message.success('Imagen actualizada correctamente');
                });
            }
        );
    };

    const handleEditProfile = async () => {
        try {
            await updateDoc(doc(db, 'users', myUid), { name: newName });
            message.success('Perfil actualizado correctamente');
            setIsEditProfileModalOpen(false);
        } catch (error) {
            console.error('Error actualizando el perfil:', error);
            message.error('Error al actualizar el perfil');
        }
    };

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
            ]}
        >
            <Card.Meta
                title={myData?.name || 'Nombre del Entrenador'}
                description={myData?.email || 'Email del Entrenador'}
            />

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

export default TrainerProfile;
