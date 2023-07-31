import { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase.config';
import { collection, doc, onSnapshot } from 'firebase/firestore';
const Context = createContext({});

export function ContextAuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  const [myUid, setMyUid] = useState('');
  const [myData, setMyData] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        setMyUid(uid);

        // Consultar los datos del usuario actual y actualizar el estado myData
        const userRef = doc(db, 'users', uid);
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setMyData({ id: doc.id, ...doc.data() });
          } else {
            setMyData(null);
          }
        });

        setIsLogged(true);
      } else {
        // User is signed out
        setMyUid('');
        setMyData(null);
        setIsLogged(false);
      }
    });
  }, []);

  return (
    <Context.Provider value={{ isLogged, setIsLogged, myData, myUid }}>
      {children}
    </Context.Provider>
  );
}

export default Context;
