import styles from '../styles/register.module.css';
import Header from '../components/header';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useRouter } from 'next/router';

export default function register() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const { push } = useRouter();

  const changeUser = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };
  const registerUser = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      push('/');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.register}>
        <div>
          <input
            name='email'
            type='text'
            placeholder='Usuario'
            className={styles.input}
            onChange={changeUser}
          />
        </div>
        <div>
          <input
            name='password'
            type='password'
            placeholder='Contraseña'
            className={styles.input}
            onChange={changeUser}
          />
        </div>
        <div>
          <button onClick={registerUser}>Registro</button>
        </div>
      </div>
    </div>
  );
}
