import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/program.module.css';
import ClientHeader from '../../components/client/clientHeader';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
import AuthContext from '../../context/AuthContext';
import { follow } from '../../forms/initialForm';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import MyImages from '../../components/client/myImages';
const program = () => {
  const revision = '10 Enero';
  const { myData, myUid } = useContext(AuthContext);
  const [formDataFollow, setFormDataFollow] = useState(follow);
  const [myForm, setMyForm] = useState([]);
  const [expand, setExpand] = useState(true);

  const handleSubmitFollow = (event) => {
    event.preventDefault();
    console.log(formDataFollow);
    handleCreateFollow();
  };
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyForm(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);
  const handleCreateFollow = async (e) => {
    try {
      await addDoc(collection(db, 'forms'), {
        ...formDataFollow,
        link: myUid,
        type: 'Semanal',
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleMeasuresChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      measures: {
        ...formDataFollow.measures,
        [event.target.name]: event.target.value,
      },
    });
  };
  const handlePhotosChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      photos: {
        ...formDataFollow.photos,
        [event.target.name]: event.target.files[0],
      },
    });
  };

  return (
    <div className={styles.programContainer}>
      <ClientHeader />
      <div className={styles.programlayout}>
        <ClientProfile />
        {/* <MyImages /> */}
        <div className={styles.nextrevision}>Próxima revisión:{revision}</div>
        <TrainersList />
      </div>
    </div>
  );
};

export default program;
