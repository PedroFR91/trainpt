import React, { useContext } from 'react';
import styles from '../../styles/program.module.css';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
import AuthContext from '../../context/AuthContext';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import MyRoutines from '../../components/client/myroutines';

import Link from 'next/link';
import MyDiet from '../../components/client/MyDiet';
import MyReviews from '../../components/client/myReviews';
import MyMeasurements from '../../components/client/MyMeasurements';
import MyPhotos from '../../components/client/MyPhotos';
const program = () => {
  const { myUid } = useContext(AuthContext);

  return (
    <div className={styles.programlayout}>
      <ClientProfile />
      <Link href={'/chat/chat'} style={{ color: '#fff' }}>
        <IoChatbubbleEllipsesOutline size={50} className={styles.chatIcon} />
      </Link>
      <TrainersList />
      <h3>Mis Rutinas</h3>
      <MyRoutines myUid={myUid} />
      <h3>Mi Dieta</h3>
      <MyDiet myUid={myUid} />
      <h3>Mis Revisiones</h3>
      <MyReviews myUid={myUid} />
      <h3>Mis Medidas</h3>
      <MyMeasurements myUid={myUid} />

      <MyPhotos myUid={myUid} />
    </div>

  );
};

export default program;
