import { useContext, useState } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import AuthContext from '../context/AuthContext';
import { useAuthUser } from '../hooks/useAuthUser';
import { useRouter } from 'next/router';
import {
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from '../firebase.config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

export default function Home() {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const { push } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState('trainer');
  const [error, setError] = useState(false);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const userData = {
        id: user.uid,
        email: user.email,
        role: selected,
        img: user.photoURL,
        timeStamp: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', user.uid), userData);
      if (selected === 'trainer') {
        push('/trainer/home');
      } else {
        push('/client/program');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;
      if (user.role === 'trainer') {
        push('/trainer/home');
      } else {
        push('/client/program');
      }
    } catch (error) {
      setError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        id: res.user.uid,
        email,
        role: selected,
        timeStamp: serverTimestamp(),
      });
      if (selected === 'trainer') {
        push('/trainer/home');
      } else {
        push('/client/program');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <video
        src='/background.mp4'
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          width: '100%',
          left: '50%',
          top: '50%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          zIndex: '-1',
        }}
      />

      <div className={styles.left}>
        {toggleView ? (
          <div>
            <form onSubmit={handleRegister}>
              <input
                type='email'
                placeholder='Correo'
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type='password'
                placeholder='Contraseña'
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type='submit'>Crear cuenta</button>
              <div onClick={signInWithGoogle}>
                {' '}
                <Image
                  src={'/google.png'}
                  alt={'google image for login'}
                  width={55}
                  height={40}
                />
                <p>Accede con Google</p>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <form onSubmit={handleLogin}>
              <input
                type='email'
                placeholder='Correo'
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type='password'
                placeholder='Contraseña'
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type='submit'>Acceder</button>
              <div onClick={signInWithGoogle}>
                <Image
                  src={'/google.png'}
                  alt={'google image for login'}
                  width={55}
                  height={40}
                />
                <p>Accede con Google</p>
              </div>
            </form>
          </div>
        )}
        <div className={styles.toggleButton}>
          <div onClick={() => setToggleView(!toggleView)}>
            {toggleView
              ? '¿Estás registrado?, accede'
              : '¿No tienes cuenta?, creala'}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div>
          <Image
            src='/logo.png'
            width={480}
            height={160}
            alt='Logo de Empresa. TrainPT'
          />
        </div>
      </div>
    </div>
  );
}
