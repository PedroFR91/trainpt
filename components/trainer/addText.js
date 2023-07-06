// AddText.js

import React, { useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/myprofile.module.css';
import Modal from './Modal';
import dynamic from 'next/dynamic';

// Importa el componente RichTextEditor de forma dinámica
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});

const AddText = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState('');
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    fetchText();
    setClientSide(true); // Indicar que estamos en el lado del cliente
  }, []);

  const updateText = async () => {
    const docRef = doc(db, 'users', myUid);

    await updateDoc(docRef, {
      mytext: text,
    });
  };

  const fetchText = async () => {
    const docRef = doc(db, 'users', myUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const storedData = docSnap.data().mytext;
      if (storedData) {
        setData(storedData);
        setText(storedData);
      }
    } else {
      console.log('No such document!');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    updateText();
    closeModal();
  };

  return (
    <div className={styles.addText}>
      <button onClick={openModal} className={styles.label}>
        Editar texto
      </button>
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <h1>Editor de texto enriquecido</h1>
        {clientSide && <RichTextEditor value={text} onChange={setText} />}
        <button onClick={handleSave}>Guardar</button>
      </Modal>
      <div
        className={styles.displayText}
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
    </div>
  );
};

export default AddText;
