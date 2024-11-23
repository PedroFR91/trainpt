// components/layout/Sidebar.js
import React, { useContext } from 'react';
import { Menu } from 'antd';
import { HomeOutlined, UserOutlined, CalendarOutlined, ProfileOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ onSelectSection }) => {
    const { role } = useContext(AuthContext);

    const trainerMenuItems = [
        { key: 'home', icon: <HomeOutlined />, label: 'Home' },
        { key: 'profile', icon: <ProfileOutlined />, label: 'Mi Perfil' },
        { key: 'routines', icon: <FileTextOutlined />, label: 'Rutinas' },
        { key: 'forms', icon: <FileTextOutlined />, label: 'Formularios' },
        { key: 'files', icon: <FileTextOutlined />, label: 'Archivos' },
    ];

    const clientMenuItems = [
        { key: 'program', icon: <HomeOutlined />, label: 'Mi Programa' },
        { key: 'subscription', icon: <SettingOutlined />, label: 'Suscripción' },
    ];

    const menuItems = role === 'trainer' ? trainerMenuItems : clientMenuItems;

    return (
        <Menu theme="dark" mode="inline" onClick={(e) => onSelectSection(e.key)}>
            {menuItems.map(item => (
                <Menu.Item key={item.key} icon={item.icon}>
                    {item.label}
                </Menu.Item>
            ))}
        </Menu>
    );
};

export default Sidebar;
