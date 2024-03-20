import React, { useContext } from 'react';
import styles from '../../styles/trainerHeader.module.css';
import Link from 'next/link';
import Image from 'next/image';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import {
  FaCamera,
  FaChartLine,
  FaFile,
  FaMale,
  FaRunning,
} from 'react-icons/fa';

import { FiLogOut } from 'react-icons/fi';

const clientHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);


  const exit = (e) => {
    e.preventDefault();
    console.log('signout');
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        push('../../');
      })
      .catch((error) => {
        // An error happened.
      });
  };


  return (
    <div className={styles.container}>
      <Link href={'/client/home'}>
        <Image
          src='/logo.png'
          priority
          width={210}
          height={70}
          alt='Logo de Empresa. TrainPT'
          className={styles.logo}
        />
      </Link>
      <div>
        <Link passHref href={'./program'}>
          <div className={styles.menuItem}>
            <FaMale size={50} />
          </div>
        </Link>
        <Link passHref href={'./train'}>
          <div className={styles.menuItem}>
            <FaRunning size={50} />
          </div>
        </Link>
        <Link passHref href={'./forms'}>
          <div className={styles.menuItem}>
            <FaFile size={50} />
          </div>
        </Link>
        <Link passHref href={'./photos'}>
          <div className={styles.menuItem}>
            <FaCamera size={50} />
          </div>
        </Link>
        <Link passHref href={'./measures'}>
          <div className={styles.menuItem}>
            <FaChartLine size={50} />
          </div>
        </Link>
        {isLogged && (
          <div onClick={exit}>
            <Link passHref href={'../'}>
              <div className={styles.menuItem}>
                <FiLogOut size={50} />
                Cerrar Sesión
              </div>
            </Link>
          </div>
        )}
      </div>


    </div>
  );
};

export default clientHeader;
