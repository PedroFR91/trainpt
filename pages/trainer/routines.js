import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Routine from '../../components/general/routine';
import Chat from '../../components/chat/chat';
const routines = () => {
  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Routine />
      <Chat />
    </div>
  );
};

export default routines;
