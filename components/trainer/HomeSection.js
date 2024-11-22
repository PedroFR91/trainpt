// components/trainer/HomeSection.js
import React from 'react';
import { Card, Row, Col } from 'antd';
import UserList from './userList';
import Calendar from './calendar';

const HomeSection = () => (
    <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
            <Card title="Mis Clientes" bordered={false}>
                <UserList />
            </Card>
        </Col>
        <Col xs={24} md={12}>
            <Card title="Calendario" bordered={false}>
                <Calendar />
            </Card>
        </Col>
    </Row>
);

export default HomeSection;
