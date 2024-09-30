import { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase.config';
import { doc, onSnapshot } from 'firebase/firestore';

const Context = createContext({});

export function ContextAuthProvider({ children }) {
  const [isMounted, setIsMounted] = useState(false); // Flag para saber si estamos en el cliente
  const [isLogged, setIsLogged] = useState(false);
  const [myUid, setMyUid] = useState('');
  const [myData, setMyData] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const auth = getAuth();

  // Usar `useEffect` para manejar sessionStorage solo en el cliente
  useEffect(() => {
    setIsMounted(true); // Indicar que el componente ya está montado en el cliente

    if (typeof window !== 'undefined') {
      // Recuperar los datos desde sessionStorage después de que el componente esté montado
      const savedIsLogged = sessionStorage.getItem('isLogged');
      const savedMyUid = sessionStorage.getItem('myUid');
      const savedMyData = sessionStorage.getItem('myData');

      if (savedIsLogged === 'true') setIsLogged(true);
      if (savedMyUid) setMyUid(savedMyUid);
      if (savedMyData) setMyData(JSON.parse(savedMyData));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setMyUid(uid);
        if (isMounted) {
          sessionStorage.setItem('myUid', uid);  // Guardar UID en sessionStorage solo en el cliente
        }

        // Consultar los datos del usuario y actualizar `myData`
        const userRef = doc(db, 'users', uid);
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = { id: doc.id, ...doc.data() };
            setMyData(userData);
            if (isMounted) {
              sessionStorage.setItem('myData', JSON.stringify(userData)); // Guardar myData en sessionStorage solo en el cliente
            }
          } else {
            setMyData(null);
            if (isMounted) {
              sessionStorage.removeItem('myData');
            }
          }
        });

        setIsLogged(true);
        if (isMounted) {
          sessionStorage.setItem('isLogged', 'true');  // Guardar estado de sesión en sessionStorage solo en el cliente
        }
      } else {
        // Usuario no autenticado
        setMyUid('');
        setMyData(null);
        setIsLogged(false);
        if (isMounted) {
          sessionStorage.removeItem('myUid');
          sessionStorage.removeItem('myData');
          sessionStorage.setItem('isLogged', 'false');
        }
      }
    });

    return () => unsubscribe();
  }, [isMounted]);

  // Si el componente aún no ha sido montado, no rendereamos nada dependiente de la autenticación
  if (!isMounted) {
    return null; // O un indicador de carga si prefieres
  }

  return (
    <Context.Provider value={{
      isLogged, setIsLogged, myData, myUid, selectedClientId, setSelectedClientId,
    }}>
      {children}
    </Context.Provider>
  );
}

export default Context;
