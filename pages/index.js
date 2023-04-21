import { useContext, useState } from 'react';

import Image from 'next/image';
import styles from '../styles/Home.module.css';
import Login from '../pages/login';
import Register from '../pages/register';
import AuthContext from '../context/AuthContext';
import { useAuthUser } from '../hooks/useAuthUser';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';

export default function Home() {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const { push } = useRouter();

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
    <>
      <div className={styles.container}>
        <div className={styles.left}>
          {toggleView ? (
            <div>
              <Register />
            </div>
          ) : (
            <div>
              <Login />
            </div>
          )}
          <div className={styles.toggleButton}>
            {' '}
            <button onClick={() => setToggleView(!toggleView)}>
              {toggleView ? 'Accede' : 'Regístrate'}
            </button>
          </div>
        </div>

        <div className={styles.right}>
          <div>
            <Image
              src='/logo.png'
              width={480}
              height={160}
              alt='Logo de Empresa. TrainPT'
            />
          </div>
        </div>
      </div>
    </>
  );
}
