// components/trainer/FormsSection.js
import React from 'react';
import { Card, Tabs } from 'antd';
import Forms from './forms';
import ClientForms from './ClientForms';
import TabPane from 'antd/es/tabs/TabPane';

const FormsSection = () => (
    <Card title="Formularios" bordered={false} style={{ width: '100%' }}>
        <Tabs defaultActiveKey="1">
            <TabPane tab="Mis Formularios" key="1">
                <Forms />
            </TabPane>
            <TabPane tab="Formularios de Clientes" key="2">
                <ClientForms />
            </TabPane>
        </Tabs>
    </Card>
);

export default FormsSection;
