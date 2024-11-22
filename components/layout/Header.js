// components/layout/Header.js

import React, { useContext, useEffect, useState } from 'react';
import { Layout, Avatar, Button, Badge, Dropdown, Menu, notification } from 'antd';
import { LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import Link from 'next/link';
import AuthContext from '../../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import styles from '../../styles/Header.module.css';

const { Header } = Layout;

const DashboardHeader = ({ onLogout, newMessages }) => {
    const { myData, myUid } = useContext(AuthContext);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (myData?.role === 'trainer') {
            const q = query(
                collection(db, 'subscriptions'),
                where('trainerId', '==', myUid),
                where('status', '==', 'pending')
            );
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const requests = [];
                querySnapshot.forEach((doc) => {
                    requests.push({ id: doc.id, ...doc.data() });
                });
                setPendingRequests(requests);
                setPendingCount(requests.length);
            });
            return () => unsubscribe();
        }
    }, [myData, myUid]);

    const handleAcceptRequest = async (requestId) => {
        try {
            const requestRef = doc(db, 'subscriptions', requestId);
            await updateDoc(requestRef, {
                status: 'active',
                acceptedAt: new Date(),
            });
            notification.success({
                message: 'Solicitud aceptada',
                description: 'Has aceptado la solicitud del cliente.',
            });
        } catch (error) {
            console.error('Error al aceptar la solicitud:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo aceptar la solicitud.',
            });
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const requestRef = doc(db, 'subscriptions', requestId);
            await updateDoc(requestRef, {
                status: 'rejected',
                rejectedAt: new Date(),
            });
            notification.success({
                message: 'Solicitud rechazada',
                description: 'Has rechazado la solicitud del cliente.',
            });
        } catch (error) {
            console.error('Error al rechazar la solicitud:', error);
            notification.error({
                message: 'Error',
                description: 'No se pudo rechazar la solicitud.',
            });
        }
    };

    const menu = (
        <Menu>
            {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                    <Menu.Item key={request.id}>
                        <span>Solicitud de cliente: {request.username}/{request.email}</span>
                        <div>
                            <Button type="link" onClick={() => handleAcceptRequest(request.id)}>
                                Aceptar
                            </Button>
                            <Button type="link" danger onClick={() => handleRejectRequest(request.id)}>
                                Rechazar
                            </Button>
                        </div>
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item>No tienes solicitudes pendientes</Menu.Item>
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
                    {myData?.role === 'trainer' && (
                        <Dropdown overlay={menu} trigger={['click']}>
                            <Badge count={pendingCount} offset={[10, 0]}>
                                <BellOutlined style={{ fontSize: 20, marginRight: 20, color: '#ffffff' }} />
                            </Badge>
                        </Dropdown>
                    )}
                    <Link href="/subscription/[clientId]">
                        <SettingOutlined style={{ fontSize: 20, marginRight: 20, color: '#ffffff' }} />
                    </Link>
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
        </Header>
    );
};

export default DashboardHeader;
