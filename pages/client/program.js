import React from 'react';
import styles from '../../styles/program.module.css';
import ClientHeader from '../../components/client/clientHeader';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
const program = () => {
  const revision = '10 Enero';
  return (
    <div className={styles.programContainer}>
      <ClientHeader />
      <div className={styles.programlayout}>
        <div className={styles.horizontal}>
          <ClientProfile />
          <div className={styles.datacontainer}>
            <div>Datos semanales</div>
            <div>
              <div>Medidas</div>
              <div>Fotos</div>
            </div>
          </div>
        </div>

        <div className={styles.nextrevision}>Próxima revisión:{revision}</div>
        <div>Entrenadores Disponibles</div>
        <TrainersList />
      </div>
    </div>
  );
};

export default program;
