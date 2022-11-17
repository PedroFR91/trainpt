import styles from '../styles/header.module.css';
import Image from 'next/image';
import Link from 'next/link';
export default function header() {
  return (
    <div className={styles.container}>
      <Image
        src='/logo.png'
        width={300}
        height={100}
        alt='Logo de Empresa. TrainPT'
      />
      <div className={styles.selector}>
        <Link href={'./login'} className={styles.button}>
          Login
        </Link>
        <Link href={'./register'} className={styles.button}>
          Registro
        </Link>
      </div>
    </div>
  );
}
