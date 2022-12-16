import React, { useContext } from 'react';
import styles from '../../styles/trainerHeader.module.css';
import Link from 'next/link';
import Image from 'next/image';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
const trainerHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);

  const exit = (e) => {
    e.preventDefault();
    console.log('signout');
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div className={styles.container}>
      <Link href={'/trainer/home'}>
        <Image
          src='/logo.png'
          priority
          width={300}
          height={100}
          alt='Logo de Empresa. TrainPT'
        />
      </Link>
      <div className={styles.menu}>
        <Link href={'./home'} className={styles.button}>
          Inicio
        </Link>
        <Link href={'./profile'} className={styles.button}>
          Perfil
        </Link>
        <Link href={'./routines'} className={styles.button}>
          Rutinas
        </Link>
        <Link href={'./forms'} className={styles.button}>
          Formularios
        </Link>
        <Link href={'./files'} className={styles.button}>
          Archivos
        </Link>
      </div>
      {isLogged && (
        <div onClick={exit}>
          <Link href={'../'}>
            <h3>
              <FaSignOutAlt />
            </h3>
          </Link>
        </div>
      )}
    </div>
  );
};

export default trainerHeader;
