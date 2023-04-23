import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import TrainerHeader from '../../components/trainer/trainerHeader';
import Routine from '../../components/general/routine';
const routines = () => {
  const [routines, setRoutines] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [step, setStep] = useState(1);

  return (
    <div className={styles.container}>
      <TrainerHeader />
      <Routine />
    </div>
  );
};

export default routines;
