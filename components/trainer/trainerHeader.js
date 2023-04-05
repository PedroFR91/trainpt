import { useState, useContext } from 'react';
import styles from '../../styles/trainerHeader.module.css';
import Image from 'next/image';
import Link from 'next/link';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaUser,
  FaDumbbell,
  FaClipboard,
  FaFolder,
} from 'react-icons/fa';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const TrainerHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
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
              <FiMenu />
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
              <FiX />
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
              <Link passHref href={'./home'}>
                <span className={styles.menuItem}>
                  <FaHome /> Inicio
                </span>
              </Link>
              <Link passHref href={'./profile'}>
                <span className={styles.menuItem}>
                  <FaUser /> Perfil
                </span>
              </Link>
              <Link passHref href={'./routines'}>
                <span className={styles.menuItem}>
                  <FaDumbbell /> Rutinas
                </span>
              </Link>
              <Link passHref href={'./forms'}>
                <span className={styles.menuItem}>
                  <FaClipboard /> Formularios
                </span>
              </Link>
              <Link passHref href={'./files'}>
                <span className={styles.menuItem}>
                  <FaFolder /> Archivos
                </span>
              </Link>
              {isLogged && (
                <div onClick={exit}>
                  <Link passHref href={'../'}>
                    <span className={styles.menuItem}>
                      <FiLogOut />
                      Cerrar Sesión
                    </span>
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

export default TrainerHeader;
