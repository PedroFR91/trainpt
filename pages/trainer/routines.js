import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Routine from '../../components/general/routine';

const routines = () => {
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Routine />

    </div>
  );
};

export default routines;
