import React from 'react';
import { Card, Row, Col } from 'antd';
import ClientProfile from './clientProfile';
import MyRoutines from './myroutines';
import MyDiet from './MyDiet';
import MyMeasurements from './MyMeasurements';
import MyPhotos from './MyPhotos';
import AssignedForms from './AssignedForms';
import MiniCalendar from './MiniCalendar'; // Importa el mini calendario

const ProgramSection = () => (
    <Row
        gutter={[16, 16]}
        style={{
            height: '100%', // Usa todo el espacio disponible
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {/* Primera fila */}
        <Row gutter={[16, 16]} style={{ flex: 1 }}>
            <Col xs={24} md={12} lg={6}>
                <Card title="Perfil del Cliente" bordered={false} style={{ height: '100%' }}>
                    <ClientProfile />
                </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
                <Card title="Mi Dieta y Rutinas" bordered={false} style={{ height: '100%' }}>
                    <MyDiet />
                    <MyRoutines />
                </Card>
            </Col>
            <Col xs={24} md={12} lg={12}>
                <Card title="Mis Revisiones" bordered={false} style={{ height: '100%' }}>
                    <MiniCalendar />
                </Card>
            </Col>
        </Row>

        {/* Segunda fila */}
        <Row gutter={[16, 16]} style={{ flex: 1 }}>
            <Col xs={24} md={12} lg={8}>
                <Card title="Mis Formularios" bordered={false} style={{ height: '100%' }}>
                    <AssignedForms />
                </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
                <Card title="Mis Medidas" bordered={false} style={{ height: '100%' }}>
                    <MyMeasurements />
                </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
                <Card title="Mis Fotos" bordered={false} style={{ height: '100%' }}>
                    <MyPhotos />
                </Card>
            </Col>
        </Row>
    </Row>
);

export default ProgramSection;
