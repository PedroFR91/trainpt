import React, { useContext, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';

const DynamicEditorComponent = dynamic(() => import('./EditorComponent'), {
  ssr: false,
});

const AddText = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchText();
  }, []);

  const updateText = async () => {
    if (!data || !data.blocks) {
      return;
    }
    const docRef = doc(db, 'users', myUid);
    const blocks = data.blocks.map((block) => ({
      type: block.type,
      data: block.data,
    }));
    await updateDoc(docRef, {
      mytext: JSON.stringify({ blocks: blocks }),
    });
  };

  const fetchText = async () => {
    const docRef = doc(db, 'users', myUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const storedData = docSnap.data().mytext;
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } else {
      console.log('No such document!');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.addText}>
      <DynamicEditorComponent
        data={data}
        onDataChange={(newData) => {
          setData(newData);
          updateText();
        }}
      />
    </div>
  );
};

export default AddText;
