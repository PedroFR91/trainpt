import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Button, Badge, Dropdown, Menu, notification, Modal, Switch } from 'antd';
import { LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { doc, getDoc, updateDoc, collection, onSnapshot, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    const [notifications, setNotifications] = useState([]);

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

    // Obtener notificaciones
    useEffect(() => {
        if (!myUid) return;

        const notificationsRef = collection(db, 'trainers', myUid, 'notifications');
        const unsubscribe = onSnapshot(notificationsRef, (snapshot) => {
            const notifs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [myUid]);

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

    const handleNotificationClick = (notif) => {
        if (notif.type === 'trainer_request') {
            Modal.confirm({
                title: 'Solicitud de cliente',
                content: `El cliente ${notif.clientId} quiere conectarse contigo. ¿Deseas aprobar la solicitud?`,
                onOk: () => approveClientRequest(notif.clientId, notif.id),
                onCancel: () => declineClientRequest(notif.clientId, notif.id),
            });
        }
    };

    const approveClientRequest = async (clientId, notifId) => {
        try {
            // Crear o actualizar la suscripción en la colección 'subscriptions'
            const subscriptionRef = doc(db, 'subscriptions', `${clientId}_${myUid}`);
            await setDoc(subscriptionRef, {
                clientId,
                trainerId: myUid,
                status: 'active',
                timestamp: serverTimestamp(),
            });

            // Eliminar la notificación
            const notifRef = doc(db, 'trainers', myUid, 'notifications', notifId);
            await deleteDoc(notifRef);

            notification.success({
                message: 'Solicitud aprobada',
                description: `Has aprobado la solicitud del cliente ${clientId}.`,
            });
        } catch (error) {
            console.error('Error al aprobar la solicitud:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo aprobar la solicitud.',
            });
        }
    };

    const declineClientRequest = async (clientId, notifId) => {
        try {
            // Eliminar la notificación
            const notifRef = doc(db, 'trainers', myUid, 'notifications', notifId);
            await deleteDoc(notifRef);

            notification.info({
                message: 'Solicitud rechazada',
                description: `Has rechazado la solicitud del cliente ${clientId}.`,
            });
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo rechazar la solicitud.',
            });
        }
    };

    const notificationMenu = (
        <Menu>
            {notifications.length > 0 ? (
                notifications.map((notif) => (
                    <Menu.Item key={notif.id} onClick={() => handleNotificationClick(notif)}>
                        {notif.message}
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item disabled>No tienes notificaciones</Menu.Item>
            )}
        </Menu>
    );

    return (
        <Header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', color: '#ffffff' }}>
                <div style={{ flex: 1 }}>
                    <h2>Dashboard</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Dropdown overlay={notificationMenu} trigger={['click']}>
                        <Badge count={notifications.length} offset={[0, 10]}>
                            <BellOutlined style={{ fontSize: 20, marginRight: 20, color: '#ffffff' }} />
                        </Badge>
                    </Dropdown>
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
