// components/trainer/FilesSection.js
import React from 'react';
import { Card } from 'antd';
import Files from './Files';

const FilesSection = () => (
    <Card title="Archivos" bordered={false} style={{ width: '100%' }}>
        <Files />
    </Card>
);

export default FilesSection;
