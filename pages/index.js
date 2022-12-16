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
      <div className={styles.container}>
        <Header />
        {!isLogged && (
          <>
            <div className={styles.access}>
              {!toggleView && <Login />}
              {toggleView && <Register />}
            </div>
            <div className={styles.bottomtext}>
              {toggleView && (
                <p onClick={() => setToggleView(!toggleView)}>
                  {' '}
                  ¿Ya estás registrado?, accede.
                </p>
              )}
              {!toggleView && (
                <p onClick={() => setToggleView(!toggleView)}>
                  Crea tu cuenta.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
