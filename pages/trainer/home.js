import React, { useState } from 'react';
import styles from '../../styles/trainerhome.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';
import Calendar from '../../components/trainer/calendar';
const home = () => {
  const date = new Date();

  const month = date.toLocaleString('es-ES', { month: 'long' });
  return (
    <>
      <TrainerHeader />
      <div className={styles.container}>
        <h1> Mis Clientes</h1>
        <UserList />
        <h1>Próximos Eventos</h1>
        <Calendar />
      </div>
    </>

  );
};

export default home;
