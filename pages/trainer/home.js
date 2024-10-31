import React, { useContext, useState } from 'react';
import { Layout, Menu, Breadcrumb, Input, Card, Avatar, Col, Row, Button } from 'antd';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { PlusOutlined, SearchOutlined, FullscreenOutlined, CloseOutlined } from '@ant-design/icons';
import UserList from '../../components/trainer/userList';
import Calendar from '../../components/trainer/calendar';
import TrainerProfile from '../../components/trainer/trainerProfile';
import MyProfile from '../../components/trainer/myprofile';
import Rates from '../../components/trainer/myrates';
import PreviousImages from '../../components/trainer/previousClientsImg';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/trainerhome.module.css';
import Forms from '../../components/trainer/forms';
import Routines from '../../components/trainer/routines';
import Files from '../../components/trainer/Files';

const { Content, Sider, Header, Footer } = Layout;

const TrainerProgram = () => {
  const { myUid } = useContext(AuthContext);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('1');

  const toggleExpand = (cardKey) => {
    setExpandedCard(expandedCard === cardKey ? null : cardKey);
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
    setExpandedCard(null); // Restablece la expansión
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} onClick={handleMenuClick}>
          <Menu.Item key="1" icon={<IoChatbubbleEllipsesOutline />}>Dashboard</Menu.Item>
          <Menu.Item key="2" icon={<PlusOutlined />}>Mis Clientes</Menu.Item>
          <Menu.Item key="3" icon={<PlusOutlined />}>Calendario</Menu.Item>
          <Menu.Item key="4" icon={<PlusOutlined />}>Perfil</Menu.Item> {/* Nuevo ítem para el perfil */}
          <Menu.Item key="5" icon={<PlusOutlined />}>Formularios</Menu.Item>
          <Menu.Item key="6" icon={<PlusOutlined />}>Rutinas</Menu.Item>
          <Menu.Item key="7" icon={<PlusOutlined />}>Archivos</Menu.Item>
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
            {selectedMenu === '4' ? (
              <Row gutter={[16, 16]} className={expandedCard ? styles.expandedContent : ''}>
                {expandedCard ? (
                  <Col span={24}>
                    {expandedCard === 'Perfil del Entrenador' && renderCardContent('Perfil del Entrenador', <MyProfile />)}
                    {expandedCard === 'Tarifas' && renderCardContent('Tarifas', <Rates />)}
                    {expandedCard === 'Imágenes Anteriores' && renderCardContent('Imágenes Anteriores', <PreviousImages />)}
                  </Col>
                ) : (
                  <>
                    <Col xs={24} md={12} lg={8}>
                      {renderCardContent('Perfil del Entrenador', <MyProfile />)}
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                      {renderCardContent('Tarifas', <Rates />)}
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                      {renderCardContent('Imágenes Anteriores', <PreviousImages />)}
                    </Col>
                  </>
                )}
              </Row>
            ) : selectedMenu === '5' ? ( // Renderiza Forms
              <Forms />
            ) : selectedMenu === '6' ? ( // Renderiza Routines
              <Routines />
            ) : selectedMenu === '7' ? ( // Renderiza Files
              <Files />
            ) : (
              expandedCard ? (
                <Row justify="center" align="middle" style={{ height: '100%' }}>
                  {expandedCard === 'Mis Clientes' && renderCardContent('Mis Clientes', <UserList />)}
                  {expandedCard === 'Calendario' && renderCardContent('Calendario', <Calendar />)}
                  {expandedCard === 'Perfil del Entrenador' && renderCardContent('Perfil del Entrenador', <TrainerProfile myUid={myUid} />)}
                </Row>
              ) : (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={8}>
                    {renderCardContent('Mis Clientes', <UserList />)}
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    {renderCardContent('Calendario', <Calendar />)}
                  </Col>
                  <Col xs={24} md={12} lg={8}>
                    {renderCardContent('Perfil del Entrenador', <TrainerProfile myUid={myUid} />)}
                  </Col>
                </Row>
              )
            )}
          </div>
        </Content>


        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()} Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};

export default TrainerProgram;
