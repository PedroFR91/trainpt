import React, { useEffect, useState } from 'react';
import styles from '../../styles/addtext.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { async } from '@firebase/util';
import { db } from '../../firebase.config';
import { updateText } from '../../functions/functions';
const addText = () => {
  const [myUid, setMyUid] = useState('');
  const [data, setData] = useState([]);
  const [text, setText] = useState('Cuentanos algo sobre ti');
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      setMyUid(uid);

      // ...
    } else {
      // User is signed out
      // ...
    }
  });

  const updateText = async (e) => {
    const docRef = doc(db, 'users', myUid);
    await updateDoc(docRef, {
      mytext: e.target.value,
    });
    fecthText();
  };
  const fecthText = async () => {
    const docRef = doc(db, 'users', myUid);
    const docSnap = await getDoc(docRef);
    setText(docSnap.data().mytext);
    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data().mytext);
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!');
    }
  };

  return (
    <div className={styles.container}>
      <input type='text' onChange={updateText} />

      <div>{text}</div>
    </div>
  );
};

export default addText;
