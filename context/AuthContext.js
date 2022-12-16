import { createContext, useEffect, useState } from 'react';
const Context = createContext({});

export function ContextAuthProvider({ children }) {
  const [isLogged, setIsLogged] = useState(false);
  useEffect(() => {
    localStorage.setItem('trainPTUser', JSON.stringify(isLogged));
  }, [isLogged]);
  return (
    <Context.Provider value={{ isLogged, setIsLogged }}>
      {children}
    </Context.Provider>
  );
}

export default Context;
