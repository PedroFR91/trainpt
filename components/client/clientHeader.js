import React, { useContext } from 'react';
import styles from '../../styles/clientHeader.module.css';
import Link from 'next/link';
import Image from 'next/image';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
const clientHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const { push } = useRouter();
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
      <Link href={'/client/program'}>
        <Image
          src='/logo.png'
          priority
          width={300}
          height={100}
          alt='Logo de Empresa. TrainPT'
        />
      </Link>
      <div className={styles.menu}>
        <Link href={'./program'} className={styles.button}>
          Programa
        </Link>
        <Link href={'./train'} className={styles.button}>
          Entrenamiento
        </Link>
        <Link href={'./forms'} className={styles.button}>
          Formularios
        </Link>
        <Link href={'./photos'} className={styles.button}>
          Fotos
        </Link>
        <Link href={'./measures'} className={styles.button}>
          Medidas
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

export default clientHeader;
