import React from 'react';
import styles from '../../styles/Home.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import UserList from '../../components/trainer/userList';
import Review from '../../components/trainer/review';
const home = () => {
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <UserList />
      {/* <Review /> */}
    </div>
  );
};

export default home;
