import React, { useState, useEffect } from 'react';
import styles from '../../styles/myprofile.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';

const myprofile = () => {
  const [myUid, setMyUid] = useState('');
  const [data, setData] = useState([]);
  const auth = getAuth();
  useEffect(() => {
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
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  return (
    <>
      {data
        .filter((item) => item.id === myUid)
        .map((data) => (
          <div key={data.id} className={styles.myprofile}>
            <img src={data.img} alt={'img'} className={styles.myprofileimg} />
            <div className={styles.myprofileinfo}>
              <p>{data.username}</p>
              <p>{data.description}</p>
            </div>
          </div>
        ))}
    </>
  );
};

export default myprofile;
