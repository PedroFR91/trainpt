// components/layout/Content.js
import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import ClientDashboard from '../../pages/client/ClientDashboard';
import TrainerDashboard from '../../pages/trainer/TrainerDashboard';

const DashboardContent = () => {
    const { role } = useContext(AuthContext);

    return role === 'trainer' ? <TrainerDashboard /> : <ClientDashboard />;
};

export default DashboardContent;
