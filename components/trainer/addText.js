import React, { useContext, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';
import { HiPencil, HiOutlineCheck } from 'react-icons/hi';
const addText = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [text, setText] = useState('Añade tu descripción');
  const [showinput, setShowinput] = useState(false);

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
    <div className={styles.addText}>
      <div className={styles.text}>
        {showinput ? (
          <input type='text' onChange={updateText} placeholder={text} />
        ) : (
          <div>{text}</div>
        )}
      </div>
      <div className={styles.buttons}>
        {!showinput ? (
          <div onClick={() => setShowinput(true)}>
            <HiPencil />
          </div>
        ) : (
          <div onClick={() => setShowinput(false)}>
            <HiOutlineCheck />
          </div>
        )}
      </div>
    </div>
  );
};

export default addText;
