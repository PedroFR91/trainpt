import '../styles/globals.css';
import { ContextAuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <>
      <ContextAuthProvider>
        <Component {...pageProps} />
      </ContextAuthProvider>
    </>
  );
}
