import React from 'react';
import styles from '../../styles/trainerhome.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';

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
        <div>{month.toUpperCase()}</div>
        <div>Próximas revisiones</div>
        <div></div>
      </div>
      {/* <Review /> */}
    </div>
  );
};

export default home;
