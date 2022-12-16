import React from 'react';
import styles from '../../styles/myprofile.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Profile from '../../components/trainer/myprofile';
import AddText from '../../components/trainer/addText';
import Rates from '../../components/trainer/myrates';
import PreviousImages from '../../components/trainer/previousClientsImg';
const profile = () => {
  return (
    <div className={styles.containerProfile}>
      <TrainerHeader />
      <Profile />
      <AddText />
      <Rates />
      <PreviousImages />
    </div>
  );
};

export default profile;
