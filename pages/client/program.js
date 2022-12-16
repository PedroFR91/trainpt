import React from 'react';
import styles from '../../styles/program.module.css';
import ClientHeader from '../../components/client/clientHeader';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
const program = () => {
  return (
    <div className={styles.programContainer}>
      <ClientHeader />
      <ClientProfile />
      <TrainersList />
    </div>
  );
};

export default program;
