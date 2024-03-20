import { useState, useContext } from 'react';
import styles from '../../styles/trainerHeader.module.css';
import Image from 'next/image';
import Link from 'next/link';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { auth } from '../../firebase.config';
import { signOut } from 'firebase/auth';
import {
  FaHome,
  FaUser,
  FaDumbbell,
  FaClipboard,
  FaFolder,
} from 'react-icons/fa';
import { FiLogOut, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

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
      <div
        className={styles.menu}
      >
        <Link passHref href={'/trainer/home'}>
          <div className={styles.menuItem}>
            <FaHome size={50} />
          </div>
        </Link>
        <Link passHref href={'/trainer/profile'}>
          <div className={styles.menuItem}>
            <FaUser size={50} />
          </div>
        </Link>
        <Link passHref href={'/trainer/routines'}>
          <div className={styles.menuItem}>
            <FaDumbbell size={50} />
          </div>
        </Link>
        <Link passHref href={'/trainer/forms'}>
          <div className={styles.menuItem}>
            <FaClipboard size={50} />
          </div>
        </Link>
        <Link passHref href={'/trainer/files'}>
          <div className={styles.menuItem}>
            <FaFolder size={50} />
          </div>
        </Link>
        {isLogged && (
          <div onClick={exit}>
            <Link passHref href={'../'}>
              <div className={styles.menuItem}>
                <FiLogOut size={50} />

              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerHeader;
