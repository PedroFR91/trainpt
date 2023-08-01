import React, { useState } from 'react';
import styles from '../../styles/trainerhome.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';
import Calendar from '../../components/trainer/calendar';
import { FaCalendar, FaPersonBooth } from 'react-icons/fa';
const home = () => {
  const [viewClients, setViewClients] = useState(false);
  const [viewEvents, setViewEvents] = useState(false);
  const date = new Date();

  const month = date.toLocaleString('es-ES', { month: 'long' });
  return (
    <div className={styles.container}>
      <TrainerHeader />
      {!viewClients && !viewEvents && (
        <div className={styles.menu}>
          <div className={styles.menuItem} onClick={() => setViewClients(true)}>
            <FaPersonBooth size={50} /> Mis Clientes
          </div>
          <div className={styles.menuItem} onClick={() => setViewEvents(true)}>
            <FaCalendar size={50} /> Próximos Eventos
          </div>
        </div>
      )}
      {viewClients && <UserList />}
      {viewEvents && <Calendar />}
    </div>
  );
};

export default home;
