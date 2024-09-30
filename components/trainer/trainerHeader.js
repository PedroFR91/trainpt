import React, { useState, useContext } from 'react';
import { Menu } from 'antd';
import { MailOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import AuthContext from '../../context/AuthContext';
import { useAuthUser } from '../../hooks/useAuthUser';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.config';
import styles from '../../styles/trainerhome.module.css';

const TrainerHeader = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [current, setCurrent] = useState('mail');

  const exit = (e) => {
    e.preventDefault();
    signOut(auth).catch((error) => console.error(error));
    sessionStorage.clear();
  };

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const items = [
    {
      label: <Link href={'/trainer/home'}>Home</Link>,
      key: 'home',
      icon: <MailOutlined />,
    },
    {
      label: <Link href={'/trainer/profile'}>Profile</Link>,
      key: 'profile',
      icon: <AppstoreOutlined />,
    },
    {
      label: <Link href={'/trainer/routines'}>Routines</Link>,
      key: 'routines',
      icon: <SettingOutlined />,
    },
    {
      label: <Link href={'/trainer/forms'}>Forms</Link>,
      key: 'forms',
      icon: <AppstoreOutlined />,
    },
    {
      label: <Link href={'/trainer/files'}>Files</Link>,
      key: 'files',
      icon: <SettingOutlined />,
    },
    {
      label: isLogged && <span onClick={exit}>Logout</span>,
      key: 'logout',
      icon: <SettingOutlined />,
    },
  ];

  return (
    <div className={styles.containerHeader}>
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
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
    </div>
  );
};

export default TrainerHeader;
