import React from 'react';
import styles from '../../styles/myprofile.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Profile from '../../components/trainer/myprofile';
import Rates from '../../components/trainer/myrates';
import PreviousImages from '../../components/trainer/previousClientsImg';
import withAuth from '../../components/withAuth';


const ProfilePage = () => {
  return (
    <>
      <TrainerHeader />
      <div className={styles.containerProfile}>

        <Profile />

        {/* <Rates /> */}
        <PreviousImages />


      </div>
    </>
  );
};

export default withAuth(ProfilePage);
