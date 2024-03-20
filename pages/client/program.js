import React, { useContext } from 'react';
import styles from '../../styles/program.module.css';
import ClientHeader from '../../components/client/clientHeader';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
import AuthContext from '../../context/AuthContext';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import MyRoutines from '../../components/client/myroutines';

import Link from 'next/link';
const program = () => {
  const { myUid } = useContext(AuthContext);

  return (
    <div className={styles.programContainer}>
      {/* <ClientHeader /> */}
      <div className={styles.programlayout}>
        <ClientProfile />
        <Link href={'/chat/chat'} style={{ color: '#fff' }}>
          <IoChatbubbleEllipsesOutline size={50} className={styles.chatIcon} />
        </Link>
        <TrainersList />
        <h3>Mis Rutinas</h3>
        <MyRoutines myUid={myUid} />
        <h3>Mi Dieta</h3>
        <h3>Mis Revisiones</h3>
        <h3>Mis Medidas</h3>
        <h3>Mis Fotos</h3>
      </div>
    </div>
  );
};

export default program;
