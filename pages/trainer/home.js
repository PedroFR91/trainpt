import React from 'react';
import styles from '../../styles/trainerhome.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';
import Calendar from '../../components/trainer/calendar';
const home = () => {
  const date = new Date();

  const month = date.toLocaleString('es-ES', { month: 'long' });
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <div className={styles.userContainer}>
        <UserList />
      </div>
      <div className={styles.calendar}>
        <Calendar />
      </div>
      {/* <Review /> */}
    </div>
  );
};

export default home;
