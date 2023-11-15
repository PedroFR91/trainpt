import React, { useEffect, useState, useRef, useContext } from 'react';
import styles from '../../styles/chat.module.css';
import { FaArrowAltCircleRight, FaCommentAlt } from 'react-icons/fa';
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit, // Agregamos el import para la limitación
} from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../../context/AuthContext';

const Chat = () => {
  const { myData, myUid } = useContext(AuthContext);
  const [viewChat, setViewChat] = useState(false);
  const [message, setMessage] = useState('');
  const [myChat, setMyChat] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState([]);
  const messagesContainerRef = useRef(null);
  const prevMyChatRef = useRef([]);
  const fetchCurrentUser = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user.displayName || 'Usuario Anónimo');
    }
  };
  useEffect(() => {
    setData(myData);
  }, [myData]);
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      orderBy('timeStamp'), // Ordenamos los mensajes por timeStamp
      limit(20) // Limitamos a los últimos 20 mensajes
    );

    const unsubscribe = onSnapshot(q, (snapShot) => {
      let list = [];
      snapShot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setMyChat(list);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    prevMyChatRef.current = myChat;
  }, [myChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const chatDocRef = doc(db, 'chats', 'chat_id'); // 'chat_id' debe ser reemplazado por el ID real del chat
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          text: message,
          username: currentUser,
          timeStamp: serverTimestamp(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <>
      <div className={styles.buttonchat} onClick={() => setViewChat(true)}>
        <FaCommentAlt size={30} />
        <div>Chat</div>
      </div>
      {viewChat && (
        <div className={styles.chat}>
          <h1>Chat</h1>
          <div className={styles.chatcontainer}>
            <div className={styles.left}>
              <div className={styles.clients}>
                <div>Mis clientes</div>
              </div>
              <div className={styles.files}>
                <div>Archivos</div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.messages} ref={messagesContainerRef}>
                {myChat.map((chat) => (
                  <p key={chat.id}>
                    <img
                      src={data.img ? data.img : '/face.jpg'}
                      alt={'img'}
                      className={styles.mychatimg}
                    />
                    <span>{chat.username}: </span>
                    {chat.text}
                  </p>
                ))}
              </div>
              <form className={styles.mymessage}>
                <input
                  type='text'
                  value={message}
                  placeholder='Escribe tu mensaje...'
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>
                  <FaArrowAltCircleRight size={30} />
                </button>
              </form>
            </div>
          </div>
          <div
            className={styles.closebutton}
            onClick={() => setViewChat(false)}
          >
            X
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
