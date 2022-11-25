import { useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseconfig';
import { useRouter } from 'next/router';
import AuthContext from '../context/AuthContext';

export const useAuthUser = () => {
  const { push, pathname } = useRouter();
  const { setIsLogged } = useContext(AuthContext);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      let userLogged = user === null ? false : true;

      if (!userLogged) {
        push('/register');
        setIsLogged(false);
      } else {
        setIsLogged(true);
        //Si está registrado y quiere visitar login o register se redirige a home
        if (pathname === '/login' || pathname === '/register') {
          push('/');
        }
      }
    });
  }, []);
};
