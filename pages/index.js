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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

export default function Home() {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const { push } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [selected, setSelected] = useState('trainer');
  const [error, setError] = useState(false);
  const [message, setMessage] = useState(null);

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Verificar si el usuario ya ha iniciado sesión con correo/contraseña
      const existingUserDoc = await getDoc(doc(db, 'users', user.uid));
      const existingUserData = existingUserDoc.data();
      if (existingUserData && existingUserData.email) {
        // El usuario ha iniciado sesión previamente con correo/contraseña
        // Asociar la cuenta de Google con la cuenta de correo/contraseña
        const updatedUserData = {
          ...existingUserData,
          googleLinked: true,
        };
        await setDoc(doc(db, 'users', user.uid), updatedUserData);
        setMessage(
          'Ya has accedido con correo y contraseña. Ahora puedes acceder con Google también.'
        );
      } else {
        // El usuario está iniciando sesión con Google por primera vez
        // Crear un nuevo registro en Firestore
        const userData = {
          id: user.uid,
          email: user.email,
          username: user.displayName,
          role: selected,
          img: user.photoURL,
          timeStamp: serverTimestamp(),
          googleLinked: true,
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }
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

      // Consultar el documento del usuario en Firestore
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();

      if (userData && userData.role) {
        // Redireccionar al usuario según su rol
        if (userData.role === 'trainer') {
          push('/trainer/home');
        } else {
          push('/client/program');
        }

        // Consultar el campo "googleLinked" en Firestore y mostrar el mensaje si es necesario
        if (userData.googleLinked) {
          setMessage(
            'Ya has accedido con Google. Ahora puedes acceder con correo y contraseña también.'
          );
        }
      }
    } catch (error) {
      setError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Verificar que todos los campos estén completos
    if (!email || !password || !userName) {
      setError(true);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        id: res.user.uid,
        email,
        userName,
        password,
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
  const sections = [
    { type:'image',text: 'REIVENTA EL ENTRENAMIENTO PERSONAL ONLINE', src: '/logo.png' },
    { type:'video',text: 'MANTEN EL CONTROL DE TODOS TUS CLIENTES', src: '/background.mp4' },
    { type:'image',text: 'TU CALENDARIO DETALLADO', src: 'Foto' },
    { type:'image',text: 'AUTOMATIZA TU SEGUIMIENTO', src: 'Foto' },
    { type:'image',text: 'TU CARTA DE PRESENTACIÓN PROFESIONAL', src: '/cardtrainer.png' },
    { type:'image',text: 'COMPARTE TODO CON TUS CLEINTES', src: 'Foto' },
    { type:'image',text: 'DISFRUTA DE NUESTRO CREADOR DE RUTINAS', src: 'Foto' },
  ];
  return (
    <>
  
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
                type='text'
                placeholder='Nombre'
                onChange={(e) => setUserName(e.target.value)}
              />
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
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value='trainer'>Entrenador</option>
                <option value='client'>Cliente</option>
              </select>
              <button type='submit'>Crear cuenta</button>
              <button
                type='button'
                onClick={signInWithGoogle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {' '}
                <Image
                  src={'/google.png'}
                  alt={'google image for login'}
                  width={55}
                  height={40}
                />
                <p>Accede con Google</p>
              </button>
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
      {message && <div className={styles.message}>{message}</div>}
      </div>
      {sections.map((section, index) => (
        <div key={index} className={styles.section}>
          {index === 0 ? (
            <>
              <div className={styles.logo}>
                <img src={section.src} width='100%' />
              </div>
              <div className={styles.text}>{section.text}</div>
            </>
          ) : index % 2 === 0 ? (
            <>
              <div className={styles.text}>{section.text}</div>
              <div>
                {section.type==='image'?

<img src={section.src} width='100%' />:
<video
  src={section.src}
  width='100%'
  height='100%'
  autoPlay
  loop
  muted
/>
                }
           
              </div>
            </>
          ) : (
            <>
              <div>
                {' '}
                <video
                  src={section.src}
                  width='100%'
                  height='100%'
                  autoPlay
                  loop
                  muted
                />
              </div>
              <div className={styles.text}>{section.text}</div>
            </>
          )}
        </div>
      ))}
    </>
    
  );
}
