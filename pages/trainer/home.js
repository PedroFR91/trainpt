import React, { useContext, useState } from 'react';
import { Layout, Menu, Breadcrumb, Input, Avatar, Button } from 'antd';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import MyProfile from '../../components/trainer/myprofile';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/trainerhome.module.css';

const { Content, Sider, Header, Footer } = Layout;

const TrainerProgram = () => {
  const { myUid } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState('1');

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible className={styles.sidebar}>
        <div className={styles.logo}>TuLogo</div>
        {/* Componente de perfil en el sidebar */}
        <MyProfile />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} onClick={handleMenuClick}>
          <Menu.Item key="1" icon={<IoChatbubbleEllipsesOutline />}>Home</Menu.Item>
          <Menu.Item key="2" icon={<PlusOutlined />}>Rutinas</Menu.Item>
          <Menu.Item key="3" icon={<PlusOutlined />}>Formularios</Menu.Item>
          <Menu.Item key="4" icon={<PlusOutlined />}>Archivos</Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className={styles.header}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Inicio</Breadcrumb.Item>
            <Breadcrumb.Item>Program</Breadcrumb.Item>
          </Breadcrumb>
          <Input placeholder="Buscar..." prefix={<SearchOutlined />} style={{ width: 200, marginRight: 'auto' }} />
          <Avatar style={{ marginLeft: 'auto' }} src="https://via.placeholder.com/150" />
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className={styles.siteLayoutBackground} style={{ padding: 24, minHeight: 360 }}>
            {selectedMenu === '1' ? (
              <p>Contenido de Home</p>
            ) : selectedMenu === '2' ? (
              <p>Contenido de Rutinas</p>
            ) : selectedMenu === '3' ? (
              <p>Contenido de Formularios</p>
            ) : selectedMenu === '4' ? (
              <p>Contenido de Archivos</p>
            ) : null}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default TrainerProgram;
