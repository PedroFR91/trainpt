import { useContext } from 'react';

import styles from '../styles/header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import AuthContext from '../context/AuthContext';
import { useAuthUser } from '../hooks/useAuthUser';

export default function header() {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  return (
    <div className={styles.container}>
      <Link href={'./'}>
        <Image
          src='/logo.png'
          width={300}
          height={100}
          alt='Logo de Empresa. TrainPT'
        />
      </Link>
      {isLogged === false && (
        <div className={styles.selector}>
          <Link href={'./login'} className={styles.button}>
            Login
          </Link>
          <Link href={'./register'} className={styles.button}>
            Registro
          </Link>
        </div>
      )}
    </div>
  );
}
