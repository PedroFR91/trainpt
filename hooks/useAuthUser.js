import { useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.config';
import AuthContext from '../context/AuthContext';

export const useAuthUser = () => {
  const { setIsLogged } = useContext(AuthContext);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      let userLogged = user === null ? false : true;

      if (!userLogged) {
        setIsLogged(false);
      } else {
        setIsLogged(true);
      }
    });
  }, []);
};
