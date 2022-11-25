import styles from '../styles/login.module.css';
import Header from '../components/header';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useState } from 'react';
import { useRouter } from 'next/router';
export default function login() {
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

  const loginUser = async (e) => {
    try {
      await signInWithEmailAndPassword(
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
      <div className={styles.login}>
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
          <button onClick={loginUser}>Login</button>
        </div>
      </div>
    </div>
  );
}
