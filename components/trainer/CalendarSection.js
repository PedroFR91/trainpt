// components/trainer/CalendarSection.js
import React from 'react';
import { Card } from 'antd';
import Calendar from './calendar';

const CalendarSection = () => (
    <Card title="Calendario" bordered={false} style={{ width: '100%' }}>
        <Calendar />
    </Card>
);

export default CalendarSection;

