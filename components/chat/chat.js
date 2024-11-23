// components/chat/Chat.js

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Card, Input, Button, Upload, message } from 'antd';
import { FaArrowAltCircleRight, FaFileAlt, FaTrashAlt } from 'react-icons/fa';
import { UploadOutlined } from '@ant-design/icons';
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/chat.module.css';

const { TextArea } = Input;
const { Meta } = Card;

const Chat = ({ selectedClientId }) => {
  const { myData, myUid } = useContext(AuthContext);
  const [messageText, setMessageText] = useState('');
  const [myChat, setMyChat] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [trainerId, setTrainerId] = useState('');
  const [clientId, setClientId] = useState('');
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const fetchChatId = async () => {
      if (!myData || !myUid) return;

      if (myData.role === 'client') {
        // Obtener la suscripción activa del cliente
        const subscriptionRef = collection(db, 'subscriptions');
        const q = query(
          subscriptionRef,
          where('clientId', '==', myUid),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const subscription = querySnapshot.docs[0].data();
          setTrainerId(subscription.trainerId);
          setClientId(myUid);

          const chatId = generateChatId(myUid, subscription.trainerId);
          listenToChat(chatId);
        } else {
          message.warning('No tienes una suscripción activa con un entrenador.');
        }
      } else if (myData.role === 'trainer') {
        if (!selectedClientId) {
          message.warning('Selecciona un cliente para chatear.');
          return;
        }
        setTrainerId(myUid);
        setClientId(selectedClientId);

        const chatId = generateChatId(myUid, selectedClientId);
        listenToChat(chatId);
      }
    };

    fetchChatId();
  }, [myUid, myData, selectedClientId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [myChat]);

  const generateChatId = (id1, id2) => {
    return id1 > id2 ? `${id2}_${id1}` : `${id1}_${id2}`;
  };

  const listenToChat = (chatId) => {
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        setMyChat(doc.data().messages || []);
      } else {
        setMyChat([]);
      }
    });

    return () => unsubscribe();
  };

  const handleSendMessage = async () => {
    if (!messageText && fileList.length === 0) {
      return message.warning('Escribe un mensaje o adjunta un archivo.');
    }

    const newMessage = {
      text: messageText,
      files: fileList,
      username: myData?.username || 'Anónimo',
      timestamp: new Date(),
    };

    const chatId = generateChatId(trainerId, clientId);

    const chatDocRef = doc(db, 'chats', chatId);

    try {
      // Verificar si el documento ya existe
      const docSnap = await getDoc(chatDocRef);
      if (docSnap.exists()) {
        // Si existe, actualizarlo
        await updateDoc(chatDocRef, {
          messages: arrayUnion(newMessage),
          lastUpdated: serverTimestamp(),
        });
      } else {
        // Si no existe, crearlo
        await setDoc(chatDocRef, {
          messages: [newMessage],
          lastUpdated: serverTimestamp(),
        });
      }

      setMessageText('');
      setFileList([]);
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      message.error('Error al enviar el mensaje.');
    }
  };

  const handleFileUpload = async ({ file, onSuccess, onError }) => {
    const storageRef = ref(storage, `files/${myUid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => { },
      (error) => {
        onError(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newFile = {
          name: file.name,
          url: downloadURL,
          type: file.type,
        };
        setFileList((prevList) => [...prevList, newFile]);
        onSuccess('ok');
      }
    );
  };

  const formatMessage = (text) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.split(' ').map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part + ' ';
    });
  };

  const renderFileCard = (file) => {
    return (
      <Card
        key={file.url}
        hoverable
        cover={
          file.type.startsWith('image/') ? (
            <img alt={file.name} src={file.url} style={{ height: 120, objectFit: 'cover' }} />
          ) : file.type === 'video/mp4' ? (
            <video src={file.url} controls style={{ height: 120 }} />
          ) : (
            <FaFileAlt size={64} />
          )
        }
        actions={[
          <a href={file.url} target="_blank" rel="noopener noreferrer" key="download">
            Descargar
          </a>,
          <FaTrashAlt onClick={() => setFileList(fileList.filter((f) => f.url !== file.url))} />,
        ]}
      >
        <Meta title={file.name} />
      </Card>
    );
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {myChat.map((msg, index) => (
          <div
            key={index}
            className={msg.username === myData?.username ? styles.myMessage : styles.theirMessage}
          >
            <div>
              <strong>{msg.username}: </strong>
              <p>{formatMessage(msg.text)}</p>
              {msg.files && (
                <div className={styles.filesGallery}>
                  {msg.files.map(renderFileCard)}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      <div className={styles.inputContainer}>
        <TextArea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Escribe tu mensaje..."
          rows={2}
        />
        <Upload customRequest={handleFileUpload} showUploadList={false}>
          <Button icon={<UploadOutlined />}></Button>
        </Upload>
        <Button type="primary" icon={<FaArrowAltCircleRight />} onClick={handleSendMessage}>
          Enviar
        </Button>
      </div>

      {/* Mostrar archivos subidos antes de enviar */}
      <div className={styles.filePreview}>
        {fileList.map(renderFileCard)}
      </div>
    </div>
  );
};

export default Chat;
