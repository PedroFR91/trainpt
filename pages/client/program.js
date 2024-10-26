import React, { useContext, useState } from 'react';
import { Layout, Menu, Breadcrumb, Input, Card, Avatar, Col, Row } from 'antd';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ClientProfile from '../../components/client/clientProfile';
import MyRoutines from '../../components/client/myroutines';
import MyDiet from '../../components/client/MyDiet';
import MyMeasurements from '../../components/client/MyMeasurements';
import MyPhotos from '../../components/client/MyPhotos';
import AuthContext from '../../context/AuthContext';
import MyReviews from '../../components/client/MyReviews';
import MyForms from '../../components/client/MyForms';
import styles from '../../styles/program.module.css';

const { Content, Sider, Header, Footer } = Layout;

const Program = () => {
  const { myUid } = useContext(AuthContext);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible className={styles.sidebar}>
        <div className={styles.logo}>TuLogo</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<IoChatbubbleEllipsesOutline />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<PlusOutlined />}>Mis Rutinas</Menu.Item>
          <Menu.Item key="3" icon={<PlusOutlined />}>Dieta</Menu.Item>
          <Menu.Item key="4" icon={<PlusOutlined />}>Revisiones</Menu.Item>
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
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12} lg={8}>
                <Card title="Perfil del Cliente" bordered={false} className={styles.dashboardCard}>
                  <ClientProfile />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Mis Dieta" bordered={false} className={styles.dashboardCard}>
                  <MyDiet myUid={myUid} />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Mis Revisiones" bordered={false} className={styles.dashboardCard}>
                  <MyReviews />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Mis Formularios" bordered={false} className={styles.dashboardCard}>
                  <MyForms />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Mis Medidas" bordered={false} className={styles.dashboardCard}>
                  <MyMeasurements myUid={myUid} />
                </Card>
              </Col>
              <Col xs={24} md={12} lg={8}>
                <Card title="Mis Fotos" bordered={false} className={styles.dashboardCard}>
                  <MyPhotos myUid={myUid} />
                </Card>
              </Col>

            </Row>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default Program;
