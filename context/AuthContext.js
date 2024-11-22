import { createContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { listenToDocument } from '../services/firebase';
import { db } from '../firebase.config';

const Context = createContext({});

export function ContextAuthProvider({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [myUid, setMyUid] = useState('');
  const [myData, setMyData] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const savedIsLogged = sessionStorage.getItem('isLogged');
      const savedMyUid = sessionStorage.getItem('myUid');
      const savedMyData = sessionStorage.getItem('myData');
      const savedRole = sessionStorage.getItem('role');

      if (savedIsLogged === 'true') setIsLogged(true);
      if (savedMyUid) setMyUid(savedMyUid);
      if (savedMyData) setMyData(JSON.parse(savedMyData));
      if (savedRole) setRole(savedRole);
    }

    let unsubUser = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        setMyUid(uid);
        if (isMounted) {
          sessionStorage.setItem('myUid', uid);
        }

        try {
          // Intentar obtener el documento del entrenador
          const trainerDocRef = doc(db, 'trainers', uid);
          const trainerSnap = await getDoc(trainerDocRef);

          if (trainerSnap.exists()) {
            const trainerData = { id: trainerSnap.id, ...trainerSnap.data() };
            setRole('trainer');
            setMyData(trainerData);
            if (isMounted) {
              sessionStorage.setItem('role', 'trainer');
              sessionStorage.setItem('myData', JSON.stringify(trainerData));
            }

            // Escuchar cambios en el documento del entrenador
            unsubUser = listenToDocument(
              'trainers',
              uid,
              (docSnapshot) => {
                if (docSnapshot.exists()) {
                  const data = { id: docSnapshot.id, ...docSnapshot.data() };
                  setMyData(data);
                  if (isMounted) {
                    sessionStorage.setItem('myData', JSON.stringify(data));
                  }
                } else {
                  setMyData(null);
                  if (isMounted) {
                    sessionStorage.removeItem('myData');
                  }
                }
              },
              (error) => console.error(error)
            );

            setIsLogged(true);
            if (isMounted) {
              sessionStorage.setItem('isLogged', 'true');
            }
          } else {
            // Si no es entrenador, intentar obtener el documento del cliente
            const clientDocRef = doc(db, 'clients', uid);
            const clientSnap = await getDoc(clientDocRef);

            if (clientSnap.exists()) {
              const clientData = { id: clientSnap.id, ...clientSnap.data() };
              setRole('client');
              setMyData(clientData);
              if (isMounted) {
                sessionStorage.setItem('role', 'client');
                sessionStorage.setItem('myData', JSON.stringify(clientData));
              }

              // Escuchar cambios en el documento del cliente
              unsubUser = listenToDocument(
                'clients',
                uid,
                (docSnapshot) => {
                  if (docSnapshot.exists()) {
                    const data = { id: docSnapshot.id, ...docSnapshot.data() };
                    setMyData(data);
                    if (isMounted) {
                      sessionStorage.setItem('myData', JSON.stringify(data));
                    }
                  } else {
                    setMyData(null);
                    if (isMounted) {
                      sessionStorage.removeItem('myData');
                    }
                  }
                },
                (error) => console.error(error)
              );

              setIsLogged(true);
              if (isMounted) {
                sessionStorage.setItem('isLogged', 'true');
              }
            } else {
              // Si el usuario no existe en ninguna colección
              console.error('El documento del usuario no existe en las colecciones "trainers" o "clients"');
              setMyData(null);
              setRole(null);
              if (isMounted) {
                sessionStorage.removeItem('myData');
                sessionStorage.removeItem('role');
              }
            }
          }
        } catch (error) {
          console.error('Error al obtener los datos del usuario:', error);
        }
      } else {
        setMyUid('');
        setMyData(null);
        setIsLogged(false);
        setRole(null);
        if (isMounted) {
          sessionStorage.removeItem('myUid');
          sessionStorage.removeItem('myData');
          sessionStorage.removeItem('role');
          sessionStorage.setItem('isLogged', 'false');
        }
        if (unsubUser) {
          unsubUser();
        }
      }
    });

    return () => {
      if (unsubUser) {
        unsubUser();
      }
      unsubscribe();
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <Context.Provider value={{
      isLogged, setIsLogged, myData, myUid, role, selectedClientId, setSelectedClientId,
    }}>
      {children}
    </Context.Provider>
  );
}

export default Context;