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
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';
import { motion, AnimatePresence } from 'framer-motion';

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
          <AnimatePresence>
            {toggleView ? (
              <motion.div
                key='register'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <Register />
              </motion.div>
            ) : (
              <motion.div
                key='login'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <Login />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.right}>
          <motion.div
            className={styles.logo}
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 1 }}
          >
            <Image
              src='/logo.png'
              width={480}
              height={160}
              alt='Logo de Empresa. TrainPT'
            />
          </motion.div>
          <div className={styles.toggleButton}>
            <button onClick={() => setToggleView(!toggleView)}>
              {toggleView ? 'Accede' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
