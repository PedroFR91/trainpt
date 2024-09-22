import React from 'react';
import styles from '../../styles/trainerhome.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';
import Calendar from '../../components/trainer/calendar';
import withAuth from '../../components/withAuth'; // Importa el HOC

const Home = () => {
  const date = new Date();
  const month = date.toLocaleString('es-ES', { month: 'long' });

  return (
    <>
      <TrainerHeader />
      <div className={styles.container}>
        <UserList />
        <Calendar />
      </div>
    </>
  );
};

export default withAuth(Home); // Envuelve tu componente con el HOC
