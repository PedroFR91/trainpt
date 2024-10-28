import React, { useContext, useState } from 'react';
import { Layout, Menu, Breadcrumb, Input, Card, Avatar, Col, Row, Button } from 'antd';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PlusOutlined, SearchOutlined, FullscreenOutlined, CloseOutlined } from '@ant-design/icons';
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
  const [expandedCard, setExpandedCard] = useState(null); // Estado para rastrear la Card expandida

  // Función para alternar el estado expandido
  const toggleExpand = (cardKey) => {
    setExpandedCard(expandedCard === cardKey ? null : cardKey);
  };

  const renderCardContent = (cardKey, component) => (
    <Card
      title={cardKey}
      bordered={false}
      className={`${styles.dashboardCard} ${expandedCard === cardKey ? styles.expandedCard : ''}`}
      extra={
        <Button
          icon={expandedCard === cardKey ? <CloseOutlined /> : <FullscreenOutlined />}
          onClick={() => toggleExpand(cardKey)}
          type="text"
        />
      }
      style={expandedCard ? { width: '100%', height: '100%' } : {}}
    >
      {component}
    </Card>
  );

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
          <div className={`${styles.siteLayoutBackground} ${expandedCard ? styles.expandedContent : ''}`} style={{ padding: expandedCard ? 0 : 24, minHeight: 360 }}>
            {expandedCard ? (
              <Row justify="center" align="middle" style={{ height: '100%' }}>
                {expandedCard === 'Perfil del Cliente' && renderCardContent('Perfil del Cliente', <ClientProfile />)}
                {expandedCard === 'Mi Dieta' && renderCardContent('Mi Dieta', <MyDiet myUid={myUid} />)}
                {expandedCard === 'Mis Revisiones' && renderCardContent('Mis Revisiones', <MyReviews />)}
                {expandedCard === 'Mis Formularios' && renderCardContent('Mis Formularios', <MyForms />)}
                {expandedCard === 'Mis Medidas' && renderCardContent('Mis Medidas', <MyMeasurements myUid={myUid} />)}
                {expandedCard === 'Mis Fotos' && renderCardContent('Mis Fotos', <MyPhotos myUid={myUid} />)}
              </Row>
            ) : (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Perfil del Cliente', <ClientProfile />)}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Mi Dieta', <MyDiet myUid={myUid} />)}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Mis Revisiones', <MyReviews />)}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Mis Formularios', <MyForms />)}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Mis Medidas', <MyMeasurements myUid={myUid} />)}
                </Col>
                <Col xs={24} md={12} lg={8}>
                  {renderCardContent('Mis Fotos', <MyPhotos myUid={myUid} />)}
                </Col>
              </Row>
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default Program;
