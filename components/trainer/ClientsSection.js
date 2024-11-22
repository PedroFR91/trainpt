// components/trainer/ClientsSection.js
import React from 'react';
import { Card } from 'antd';
import UserList from './userList';

const ClientsSection = () => (
    <Card title="Mis Clientes" bordered={false} style={{ width: '100%' }}>
        <UserList />
    </Card>
);

export default ClientsSection;
