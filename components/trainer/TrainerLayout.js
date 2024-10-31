// components/trainer/TrainerLayout.js

import React from 'react';
import { Layout, Menu } from 'antd';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styles from '../../styles/trainerLayout.module.css';

const { Sider, Content } = Layout;

const TrainerLayout = ({ children }) => {
    const router = useRouter();

    const handleMenuClick = ({ key }) => {
        if (key === 'home') router.push('/trainer/home');
        if (key === 'profile') router.push('/trainer/profile');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible className={styles.sidebar}>
                <div className={styles.logo}>TuLogo</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[router.pathname.includes('profile') ? 'profile' : 'home']}
                    onClick={handleMenuClick}
                >
                    <Menu.Item key="home" icon={<HomeOutlined />}>
                        Inicio
                    </Menu.Item>
                    <Menu.Item key="profile" icon={<UserOutlined />}>
                        Mi Perfil
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Content className={styles.content}>{children}</Content>
            </Layout>
        </Layout>
    );
};

export default TrainerLayout;
