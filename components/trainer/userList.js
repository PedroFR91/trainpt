import React, { useEffect, useState, useContext } from 'react';
import { List, Avatar, Skeleton } from 'antd';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/trainerhome.module.css'; // Reutilizando el mismo archivo de estilos

const UserList = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [myData, setMyData] = useState(null);
  const { myUid } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // Obtener la información del usuario actual
    if (myUid) {
      const userRef = doc(db, 'users', myUid);
      const unsubUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setMyData(doc.data());
        }
      });

      // Obtener la lista de clientes
      const q = query(collection(db, 'subscriptions'), where('trainerId', '==', myUid));
      const unsubClients = onSnapshot(q, (querySnapshot) => {
        const clientIds = querySnapshot.docs.map((doc) => doc.data().clientId);
        if (clientIds.length > 0) {
          const clientsQuery = query(collection(db, 'users'), where('id', 'in', clientIds));
          onSnapshot(clientsQuery, (clientsSnapshot) => {
            const clientsData = clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setClients(clientsData);
            setInitLoading(false);
          });
        } else {
          setClients([]);
          setInitLoading(false);
        }
      });

      return () => {
        unsubUser();
        unsubClients();
      };
    }
  }, [myUid]);

  const handleSubscriptionLinkClick = (userId) => {
    if (myData) {
      localStorage.setItem('userRole', myData.role);
    }
    router.push(`/shared/subcription/${userId}`);
  };

  return (
    <List
      className={styles.containerList} // Aplicando el contenedor personalizado
      loading={initLoading}
      itemLayout="horizontal"
      dataSource={clients}
      renderItem={(client) => (
        <List.Item
          actions={[
            <Link href={`/shared/clients/${client.id}`} key="view">Ver Info</Link>,
            <span onClick={() => handleSubscriptionLinkClick(client.id)} key="subscription">Ver Suscripción</span>
          ]}
        >
          <Skeleton avatar title={false} loading={initLoading} active>
            <List.Item.Meta
              avatar={<Avatar src={client.img || '/face.jpg'} />}
              title={client.username}
              description="Información del cliente"
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default UserList;
