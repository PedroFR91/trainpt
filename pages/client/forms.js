import { collection, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/clientForms.module.css';
import Link from 'next/link';
const forms = () => {
  const [form, setForm] = useState([]);
  const { myData, myUid } = useContext(AuthContext);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setForm(list);
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
    <div>
      <ClientHeader />
      <div className={styles.myforms}>
        {form
          .filter((data) => data.link === myUid)
          .map((form) => (
            <div key={form.id}>
              <Link href={`/share/${form.id}`}>
                <p>{form.type}</p>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
};

export default forms;
