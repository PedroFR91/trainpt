import React, { useEffect, useState } from 'react';
import styles from '../../styles/userList.module.css';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase.config';

const userList = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // const fetchData = async () => {
    //   let list = [];
    //   try {
    //     const querySnapshot = await getDocs(collection(db, 'users'));
    //     querySnapshot.forEach((doc) => {
    //       list.push({ id: doc.id, ...doc.data() });
    //     });
    //     setData(list);
    //     console.log(list);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    // fetchData();
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

  // const handleDelete = async (id) => {
  //   try {
  //     //await deleteDoc(doc(db, 'users', id));
  //     setData(data.filter((item) => item.id !== id));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  return (
    <div className={styles.list}>
      {data
        .filter((data) => data.role === 'client')
        .map((data) => (
          <div key={data.id} className={styles.userdata}>
            <div>{data.username}</div>
            <div>status</div>
            <div>{data.name}</div>
            <div>{data.email}</div>
            <div>{data.role}</div>
            <div>
              {data.img ? (
                <img src={data.img} alt={'myprofileimg'} />
              ) : (
                <img src='/face.jpg' alt={'myprofileimg'} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default userList;
