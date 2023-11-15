import React, { useEffect, useState, useRef, useContext } from 'react';
import styles from '../../styles/chat.module.css';
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, serverTimestamp, onSnapshot, getDoc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { getAuth } from 'firebase/auth';
import AuthContext from '../../context/AuthContext';
import ClientsChatList from '../../components/clientsChatList/clientsChatList';

const Chat = () => {
  const { myData, myUid, selectedClientId } = useContext(AuthContext); // Suponiendo que selectedClientId se gestiona aquí
  const [message, setMessage] = useState('');
  const [myChat, setMyChat] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [trainerId, setTrainerId] = useState('')
  const messagesContainerRef = useRef(null);



  useEffect(() => {
    const fetchChats = async () => {
      let chatId;

      if (myData?.role === 'trainer') {
        chatId = `${myUid}_${selectedClientId}`;
      } else if (myData?.role === 'client') {
        const subscriptionsRef = collection(db, 'subscriptions');
        const q = query(subscriptionsRef, where("clientId", "==", myUid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const trainerId = querySnapshot.docs[0].data().trainerId;
          setTrainerId(trainerId);
          chatId = `${trainerId}_${myUid}`;
        } else {
          // Manejo del caso donde no se encuentra un entrenador asociado al cliente
          console.log("No se encontró un entrenador para el cliente.");
          return;
        }
      }

      if (chatId) {
        const chatDocRef = doc(db, 'chats', chatId);
        const unsubscribe = onSnapshot(chatDocRef, (doc) => {
          if (doc.exists()) {
            setMyChat(doc.data().messages);
          } else {
            setMyChat([]);
          }
        });

        return () => unsubscribe();
      }
    };

    fetchChats();
  }, [myUid, selectedClientId, myData?.role]);


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
  }, [myChat]);

  const sendMessage = async (e) => {

    e.preventDefault();

    console.log('hola cliente')
    try {
      if (myData?.role === 'trainer') {
        const chatId = `${myUid}_${selectedClientId}`;
        const chatDocRef = doc(db, 'chats', chatId);

        // Crear un nuevo mensaje con un timestamp del cliente
        const newMessage = {
          text: message,
          username: myData.username,
          // Usar un timestamp generado en el cliente
          timeStamp: new Date(),
        };

        await updateDoc(chatDocRef, {
          messages: arrayUnion(newMessage),
        });

        setMessage('');
      } else {
        console.log('hola cliente')
        const chatId = `${trainerId}_${myUid}`;

        const chatDocRef = doc(db, 'chats', chatId);

        // Crear un nuevo mensaje con un timestamp del cliente
        const newMessage = {
          text: message,
          username: myData.username,
          // Usar un timestamp generado en el cliente
          timeStamp: new Date(),
        };

        await updateDoc(chatDocRef, {
          messages: arrayUnion(newMessage),
        });
      }


    } catch (error) {
      console.log(error);
    }
    setMessage('');
  };
  function formatMessage(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const wwwRegex = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    return text.split(' ').map((part, index) => {
      if (urlRegex.test(part) || wwwRegex.test(part)) {
        let hrefPart = part;
        if (!hrefPart.startsWith('http')) {
          hrefPart = `http://${hrefPart}`;
        }
        return <a key={index} href={hrefPart} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part + ' ';
    });
  }

  return (

    <div className={styles.chat}>
      <h1>Chat</h1>
      <div className={styles.chatcontainer}>

        < div className={styles.left}>
          {myData?.role === 'trainer' ?
            <>
              <h1>Mis Clientes</h1>
              <ClientsChatList myUid={myData?.role === 'trainer' ? myUid : trainerId} />
            </> : <>
              <h1>Mis Archivos</h1>

            </>
          }
        </div>

        <div className={styles.right}>
          <div className={styles.messages} ref={messagesContainerRef}>
            {myChat.map((chat) => (
              <div key={chat.id} className={chat.username === myData.username ? styles.myMessage : styles.theirMessage}>
                <div >
                  <img
                    src={myData.img ? myData.img : '/face.jpg'}
                    alt={'img'}
                    className={styles.mychatimg}
                  />
                  <span>{chat.username} : </span>
                  <p >{formatMessage(chat.text)}</p>
                </div>
              </div>
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
    </div >

  );
};

export default Chat;
