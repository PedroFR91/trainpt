import { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase.config';
import { collection, onSnapshot } from 'firebase/firestore';
const Context = createContext({});

export function ContextAuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [myUid, setMyUid] = useState('');
  const [myData, setMyData] = useState([]);
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        setMyUid(uid);

        // ...
      } else {
        // User is signed out
        // ...
      }
    });
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);
  // useEffect(() => {
  //   localStorage.setItem('trainPTUser', JSON.stringify(isLogged));
  // }, [isLogged]);
  return (
    <Context.Provider value={{ isLogged, setIsLogged, myData, myUid }}>
      {children}
    </Context.Provider>
  );
}

export default Context;
