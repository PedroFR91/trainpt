import { useContext, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Header from '../components/general/header';
import Login from '../pages/login';
import Register from '../pages/register';
import AuthContext from '../context/AuthContext';
import { useAuthUser } from '../hooks/useAuthUser';
import { useRouter } from 'next/router';

export default function Home() {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const { push } = useRouter();

  return (
    <>
      {!isLogged && (
        <div className={styles.container}>
          <div className={styles.leftContainer}>
            <Image
              src='/logo.png'
              width={480}
              height={160}
              alt='Logo de Empresa. TrainPT'
            />
            <div className={styles.bottomtext}>
              {toggleView && (
                <button onClick={() => setToggleView(!toggleView)}>
                  Accede
                </button>
              )}
              {!toggleView && (
                <button onClick={() => setToggleView(!toggleView)}>
                  Regístrate
                </button>
              )}
            </div>
          </div>

          <div className={styles.access}>
            {!toggleView && <Login />}
            {toggleView && <Register />}
          </div>
        </div>
      )}
    </>
  );
}
