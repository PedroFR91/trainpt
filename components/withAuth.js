// components/withAuth.js
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Context from '../context/AuthContext';

const withAuth = (WrappedComponent) => {
    return (props) => {
        const { isLogged } = useContext(Context);
        const router = useRouter();

        useEffect(() => {
            if (!isLogged) {
                // Si no está autenticado, redirigir a /acceso
                router.push('/acceso');
            }
        }, [isLogged, router]);

        // Si el usuario no está autenticado, puedes mostrar un cargando hasta que la verificación termine
        if (!isLogged) {
            return <div>Loading...</div>;
        }

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
