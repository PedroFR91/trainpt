import React, { useContext, useState } from 'react';
import styles from '../../styles/clientHeader.module.css';
import Link from 'next/link';
import Image from 'next/image';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaUser,
  FaDumbbell,
  FaClipboard,
  FaFolder,
} from 'react-icons/fa';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const clientHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
      <button className={styles.menuButton} onClick={toggleMenu}>
        <AnimatePresence>
          {!isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiMenu size={50} />
            </motion.span>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FiX size={50} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.menu}
              initial={{ x: '-100%' }}
              animate={{ x: '0' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
            >
              <Link passHref href={'./program'}>
                <div className={styles.menuItem}>
                  <FaHome size={50} /> Programa
                </div>
              </Link>
              <Link passHref href={'./train'}>
                <div className={styles.menuItem}>
                  <FaUser size={50} /> Entrenamiento
                </div>
              </Link>
              <Link passHref href={'./forms'}>
                <div className={styles.menuItem}>
                  <FaDumbbell size={50} /> Formularios
                </div>
              </Link>
              <Link passHref href={'./photos'}>
                <div className={styles.menuItem}>
                  <FaClipboard size={50} /> Fotos
                </div>
              </Link>
              <Link passHref href={'./measures'}>
                <div className={styles.menuItem}>
                  <FaFolder size={50} /> Medidas
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default clientHeader;
