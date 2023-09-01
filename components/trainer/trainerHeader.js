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
              <Link passHref href={'./home'}>
                <div className={styles.menuItem}>
                  <FaHome size={50} /> Inicio
                </div>
              </Link>
              <Link passHref href={'./profile'}>
                <div className={styles.menuItem}>
                  <FaUser size={50} /> Perfil
                </div>
              </Link>
              <Link passHref href={'./routines'}>
                <div className={styles.menuItem}>
                  <FaDumbbell size={50} /> Rutinas
                </div>
              </Link>
              <Link passHref href={'./forms'}>
                <div className={styles.menuItem}>
                  <FaClipboard size={50} /> Formularios
                </div>
              </Link>
              <Link passHref href={'./files'}>
                <div className={styles.menuItem}>
                  <FaFolder size={50} /> Archivos
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

export default TrainerHeader;
