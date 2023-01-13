import React from 'react';
import styles from '../../styles/myprofile.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Profile from '../../components/trainer/myprofile';
import Rates from '../../components/trainer/myrates';
import PreviousImages from '../../components/trainer/previousClientsImg';
const profile = () => {
  return (
    <div className={styles.containerProfile}>
      <TrainerHeader />
      <div className={styles.layout}>
        <Profile />
        <div className={styles.subdivision}>
          <Rates />
          <PreviousImages />
        </div>
      </div>
    </div>
  );
};

export default profile;
