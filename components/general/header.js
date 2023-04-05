import { useState, useContext } from 'react';
import styles from '../../styles/header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function header() {
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
      <Link href={'./'}>
        <Image
          src='/logo.png'
          width={300}
          height={100}
          alt='Logo de Empresa. TrainPT'
        />
      </Link>
      {isLogged && (
        <div onClick={exit}>
          <FaSignOutAlt />
        </div>
      )}
    </div>
  );
}
