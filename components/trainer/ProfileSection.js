// components/trainer/ProfileSection.js
import React from 'react';
import { Card, Row, Col } from 'antd';
import MyProfile from './myprofile';
import Rates from './myrates';
import PreviousImages from './previousClientsImg';

const ProfileSection = () => (
    <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mi Perfil" bordered={false}>
                <MyProfile />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Tarifas" bordered={false}>
                <Rates />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Imágenes Anteriores" bordered={false}>
                <PreviousImages />
            </Card>
        </Col>
    </Row>
);

export default ProfileSection;
