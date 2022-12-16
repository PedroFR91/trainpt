import React from 'react';
import styles from '../../styles/Home.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
const routines = () => {
  return (
    <div className={styles.container}>
      <TrainerHeader />
    </div>
  );
};

export default routines;
