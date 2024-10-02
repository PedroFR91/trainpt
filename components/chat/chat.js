import React, { useState, useEffect, useRef, useContext } from 'react';
import { Card, Input, Button, Upload, message } from 'antd';
import { FaArrowAltCircleRight, FaFileAlt, FaTrashAlt } from 'react-icons/fa';
import { UploadOutlined } from '@ant-design/icons';
import { doc, updateDoc, arrayUnion, serverTimestamp, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/chat.module.css';

const { TextArea } = Input;
const { Meta } = Card;

const Chat = () => {
  const { myData, myUid } = useContext(AuthContext);
  const [messageText, setMessageText] = useState('');
  const [myChat, setMyChat] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [trainerId, setTrainerId] = useState('');
  const [clientId, setClientId] = useState('');
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const fetchChatId = async () => {
      // Suponiendo que obtienes el clientId y trainerId desde la suscripción
      const subscription = { trainerId: 'TjFuz1IyD9OcNvPaKBFvsGO2GGv2', clientId: 'K3AmWAuaUQM4jH52J2lkqF2ztfo1' };
      setTrainerId(subscription.trainerId);
      setClientId(subscription.clientId);

      // Generar el mismo chatId para ambos (cliente y entrenador) asegurando un orden consistente
      const chatId = subscription.trainerId > subscription.clientId
        ? `${subscription.clientId}_${subscription.trainerId}`
        : `${subscription.trainerId}_${subscription.clientId}`;

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

    fetchChatId();
  }, [myUid]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [myChat]);

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

    const chatId = trainerId > clientId
      ? `${clientId}_${trainerId}`
      : `${trainerId}_${clientId}`;

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
        onSuccess("ok");
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
          <FaTrashAlt onClick={() => setFileList(fileList.filter(f => f.url !== file.url))} />
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
          <div key={index} className={msg.username === myData?.username ? styles.myMessage : styles.theirMessage}>
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
          <Button icon={<UploadOutlined />}>Adjuntar Archivo</Button>
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
