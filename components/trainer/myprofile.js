import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/myprofile.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import AddText from '../trainer/addText';
const myprofile = () => {
  const { myData, myUid } = useContext(AuthContext);

  return (
    <>
      {myData
        .filter((item) => item.id === myUid)
        .map((data) => (
          <div key={data.id} className={styles.myprofile}>
            <img src={data.img} alt={'img'} className={styles.myprofileimg} />
            <div className={styles.myprofileinfo}>
              <p>{data.username}</p>
              <AddText />
            </div>
          </div>
        ))}
    </>
  );
};

export default myprofile;
