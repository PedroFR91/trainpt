// components/client/ProgramSection.js
import React from 'react';
import { Card, Row, Col } from 'antd';
import ClientProfile from './clientProfile';
import MyRoutines from './myroutines';
import MyDiet from './MyDiet';
import MyMeasurements from './MyMeasurements';
import MyPhotos from './MyPhotos';
import MyReviews from './MyReviews';
import AssignedForms from '../../components/client/AssignedForms'
const ProgramSection = () => (
    <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
            <Card title="Perfil del Cliente" bordered={false}>
                <ClientProfile />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mi Dieta" bordered={false}>
                <MyDiet />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mis Rutinas" bordered={false}>
                <MyRoutines />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mis Revisiones" bordered={false}>
                <MyReviews />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mis Formularios" bordered={false}>
                <AssignedForms />
            </Card>
        </Col>
        {/* <Col xs={24} md={12} lg={8}>
            <Card title="Mis Medidas" bordered={false}>
                <MyMeasurements />
            </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
            <Card title="Mis Fotos" bordered={false}>
                <MyPhotos />
            </Card>
        </Col> */}
    </Row>
);

export default ProgramSection;
