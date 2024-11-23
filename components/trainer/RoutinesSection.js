// components/trainer/RoutinesSection.js
import React from 'react';
import { Card } from 'antd';
import Routines from './routines';

const RoutinesSection = () => (
    <Card title="Rutinas" bordered={false} style={{ width: '100%' }}>
        <Routines />
    </Card>
);

export default RoutinesSection;
