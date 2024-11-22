// components/trainer/UserList.js

import React, { useEffect, useState, useContext } from 'react';
import { List, Avatar, Skeleton, message, Button } from 'antd';
import AuthContext from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/trainerhome.module.css';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import Chat from '../chat/Chat';

const UserList = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const { myUid, myData } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!myUid) return;

    // Escuchar las suscripciones activas del entrenador
    const q = query(
      collection(db, 'subscriptions'),
      where('trainerId', '==', myUid),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(
      q,
      async (subscriptionSnapshot) => {
        const clientIds = subscriptionSnapshot.docs.map((doc) => doc.data().clientId);
        if (clientIds.length > 0) {
          const clientsData = [];
          for (const clientId of clientIds) {
            const clientDoc = await getDoc(doc(db, 'clients', clientId));
            if (clientDoc.exists()) {
              clientsData.push({ id: clientId, ...clientDoc.data() });
            }
          }
          setClients(clientsData);
          setInitLoading(false);
        } else {
          setClients([]);
          setInitLoading(false);
        }
      },
      (error) => {
        console.error(error);
        message.error('Error al obtener las suscripciones');
        setInitLoading(false);
      }
    );

    return () => unsubscribe();
  }, [myUid]);

  const handleSubscriptionLinkClick = (clientId) => {
    if (myData) {
      localStorage.setItem('userRole', myData.role);
    }
    router.push(`/shared/subscription/${clientId}`);
  };

  const closeChat = () => {
    setSelectedClientId(null);
  };

  return (
    <div>
      <List
        className={styles.containerList}
        loading={initLoading}
        itemLayout="horizontal"
        dataSource={clients}
        renderItem={(client) => (
          <List.Item
            actions={[
              <Link href={`/shared/clients/${client.id}`} key="view">Ver Info</Link>,
              <Button key="chat" onClick={() => setSelectedClientId(client.id)}>
                {selectedClientId === client.id ? 'Chat Abierto' : 'Chatear'}
              </Button>,
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
      {selectedClientId && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Chat con el cliente</h3>
            <Button onClick={closeChat}>X</Button>
          </div>
          <Chat selectedClientId={selectedClientId} />
        </div>
      )}
    </div>
  );
};

export default UserList;
