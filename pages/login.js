import React, { useEffect, useState } from 'react';
import styles from '../styles/formStyles.module.css';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';
import { useRouter } from 'next/router';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';

const login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState(false);
  const [password, setPassword] = useState(false);
  const { push } = useRouter();
  const [myUid, setMyUid] = useState('');
  const [data, setData] = useState([]);
  const [ready, setReady] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //Signed In
        const user = userCredential.user;
        setReady(true);
        setMyUid(user.uid);
        dataLogin(user.uid);
      })
      .catch((error) => {
        setError(true);
      });
  };
  const dataLogin = async (id) => {
    try {
      const docRef = doc(db, 'users', id);
      const mydata = await getDoc(docRef);
      const myrole =
        mydata._document.data.value.mapValue.fields.role.stringValue;

      if (myrole === 'trainer') {
        push('/trainer/home');
      } else {
        push('/client/program');
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.formContainer}>
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
        <button type='submit'>Login</button>
        {error && <span>Compruebe datos de acceso o registrese</span>}
      </form>
    </div>
  );
};

export default login;
