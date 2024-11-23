// components/trainer/FormsSection.js
import React from 'react';
import { Card, Tabs } from 'antd';
import Forms from './forms';
import ClientForms from './ClientForms';


const FormsSection = () => (
    <Card title="Formularios" bordered={false} style={{ width: '100%' }}>
        <Tabs defaultActiveKey="1">
            <Tabs tab="Mis Formularios" key="1">
                <Forms />
            </Tabs>
            <Tabs tab="Formularios de Clientes" key="2">
                <ClientForms />
            </Tabs>
        </Tabs>
    </Card>
);

export default FormsSection;
