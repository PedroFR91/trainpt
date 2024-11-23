import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Button, Badge, Dropdown, Menu, notification, Modal, Switch } from 'antd';
import { LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/Header.module.css';

const { Header } = Layout;

const DashboardHeader = ({ onLogout, trainerId }) => {
    const { myData, myUid } = useContext(AuthContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [publicSections, setPublicSections] = useState({
        rates: true,
        socialMedia: true,
        comments: true,
    });

    // Cargar configuración de Firebase
    useEffect(() => {
        const fetchPublicSections = async () => {
            if (!trainerId) return;

            const docRef = doc(db, 'trainers', trainerId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setPublicSections(data.publicSections || {});
            }
        };

        fetchPublicSections();
    }, [trainerId]);

    const handleSectionToggle = async (section) => {
        if (!publicSections || !publicSections.hasOwnProperty(section)) {
            console.error(`La sección ${section} no existe en publicSections`, publicSections);
            return;
        }

        const updatedSections = { ...publicSections, [section]: !publicSections[section] };
        setPublicSections(updatedSections);

        // Actualizar en Firebase
        try {
            const docRef = doc(db, 'trainers', trainerId);
            await updateDoc(docRef, { publicSections: updatedSections });
            notification.success({
                message: 'Configuración actualizada',
                description: `La sección ${section} ha sido actualizada.`,
            });
        } catch (error) {
            console.error('Error al actualizar en Firebase:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo actualizar la configuración.',
            });
        }
    };


    return (
        <Header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', color: '#ffffff' }}>
                <div style={{ flex: 1 }}>
                    <h2>Dashboard</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Badge count={0} offset={[0, 10]}>
                        <BellOutlined style={{ fontSize: 20, marginRight: 20, color: '#ffffff' }} />
                    </Badge>
                    <Button
                        icon={<SettingOutlined />}
                        type="text"
                        style={{ marginRight: 20, color: '#ffffff' }}
                        onClick={() => setIsModalVisible(true)}
                    />
                    <Avatar src={myData?.img || '/placeholder.png'} style={{ marginRight: 10 }} />
                    <span>{myData?.username || 'Usuario'}</span>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={onLogout}
                        type="text"
                        style={{ marginLeft: 20, color: '#ffffff' }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Modal para configurar secciones públicas */}
            <Modal
                title="Configuración de Secciones Públicas"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <p>Selecciona las secciones que deseas mostrar en tu perfil público:</p>
                <div>
                    <Switch
                        checked={publicSections.rates}
                        onChange={() => handleSectionToggle('rates')}
                    /> Tarifas
                </div>
                <div>
                    <Switch
                        checked={publicSections.socialMedia}
                        onChange={() => handleSectionToggle('socialMedia')}
                    /> Redes Sociales
                </div>
                <div>
                    <Switch
                        checked={publicSections.comments}
                        onChange={() => handleSectionToggle('comments')}
                    /> Comentarios
                </div>
            </Modal>
        </Header>
    );
};

export default DashboardHeader;
