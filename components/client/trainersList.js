// components/client/TrainersList.js

import React, { useState, useEffect, useContext } from 'react';
import { Avatar, List, Button, Popconfirm, message, Space, Input, Rate, Popover } from 'antd';
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import {
  collection,
  onSnapshot,
  query,
  where,
  setDoc,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/program.module.css';

const IconText = ({ icon, text }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const TrainersList = () => {
  const [trainers, setTrainers] = useState([]);
  const { myUid } = useContext(AuthContext);
  const [currentTrainerId, setCurrentTrainerId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainers(list);
    }, (error) => {
      console.error(error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchSubscription = async () => {
      const q = query(
        collection(db, 'subscriptions'),
        where('clientId', '==', myUid),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const subscription = querySnapshot.docs[0].data();
        setCurrentTrainerId(subscription.trainerId);
      } else {
        setCurrentTrainerId(null);
      }
    };

    if (myUid) {
      fetchSubscription();
    }
  }, [myUid]);

  const handleLike = async (trainerId) => {
    try {
      const trainerRef = doc(db, 'trainers', trainerId);
      await updateDoc(trainerRef, {
        likes: arrayUnion(myUid),
      });
      message.success("¡Has dado 'Me gusta' a este entrenador!");
    } catch (error) {
      console.error('Error al dar like:', error);
      message.error('Error al dar like');
    }
  };

  const handleRating = async (trainerId, value) => {
    try {
      const trainerRef = doc(db, 'trainers', trainerId);
      await updateDoc(trainerRef, {
        ratings: arrayUnion({ userId: myUid, rating: value }),
      });
      message.success(`Has calificado con ${value} estrellas a este entrenador.`);
    } catch (error) {
      console.error('Error al calificar:', error);
      message.error('Error al calificar');
    }
  };

  const handleComment = async (trainerId, comment) => {
    try {
      const trainerRef = doc(db, 'trainers', trainerId);
      await updateDoc(trainerRef, {
        comments: arrayUnion({ userId: myUid, comment }),
      });
      message.success('Comentario agregado correctamente');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      message.error('Error al agregar comentario');
    }
  };

  // Nueva función para enviar notificación al entrenador
  const sendTrainerRequest = async (trainerId) => {
    try {
      const notifRef = collection(db, 'trainers', trainerId, 'notifications');
      await addDoc(notifRef, {
        type: 'trainer_request',
        clientId: myUid,
        message: `El cliente ${myUid} quiere conectarse contigo.`,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error al enviar la solicitud al entrenador:', error);
    }
  };

  const selectTrainer = async (trainerId) => {
    if (currentTrainerId) {
      const confirm = window.confirm(
        'Ya tienes un entrenador seleccionado. ¿Quieres cambiar de entrenador? Esto cancelará tu suscripción actual.'
      );
      if (!confirm) return;
      await deselectTrainer(currentTrainerId);
    }
    await setDoc(doc(db, 'subscriptions', `${myUid}_${trainerId}`), {
      clientId: myUid,
      trainerId: trainerId,
      status: 'pending',
      createdAt: new Date(),
    });
    // Enviar notificación al entrenador
    await sendTrainerRequest(trainerId);

    setCurrentTrainerId(trainerId);
    message.success('Solicitud enviada al entrenador');
  };

  const deselectTrainer = async (trainerId) => {
    const q = query(
      collection(db, 'subscriptions'),
      where('clientId', '==', myUid),
      where('trainerId', '==', trainerId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'subscriptions', document.id));
    });
    setCurrentTrainerId(null);
    message.success('Entrenador eliminado correctamente');
  };

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        pageSize: 3,
      }}
      dataSource={trainers}
      renderItem={(trainer) => {
        const hasLiked = trainer.likes?.includes(myUid);
        const userRating = trainer.ratings?.find((r) => r.userId === myUid)?.rating || 0;
        const averageRating = trainer.ratings
          ? (
            trainer.ratings.reduce((acc, curr) => acc + curr.rating, 0) / trainer.ratings.length
          ).toFixed(1)
          : 0;
        return (
          <List.Item
            key={trainer.id}
            actions={[
              <IconText icon={StarOutlined} text={averageRating} key="rating" />,
              <Button
                icon={<LikeOutlined />}
                onClick={() => handleLike(trainer.id)}
                key="like-button"
                disabled={hasLiked}
              >
                {trainer.likes ? trainer.likes.length : 0}
              </Button>,
              <Popover
                content={
                  <Rate
                    allowHalf
                    defaultValue={userRating}
                    onChange={(value) => handleRating(trainer.id, value)}
                  />
                }
                title="Valora este entrenador"
                trigger="click"
              >
                <Button icon={<StarOutlined />} key="rating-popover">
                  Valorar
                </Button>
              </Popover>,
              <Popover
                content={
                  <div style={{ width: 300 }}>
                    <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: '10px' }}>
                      {trainer.comments && trainer.comments.length > 0 ? (
                        <List
                          dataSource={trainer.comments}
                          renderItem={(item, index) => (
                            <List.Item key={index}>
                              <MessageOutlined /> {item.comment}
                            </List.Item>
                          )}
                          size="small"
                        />
                      ) : (
                        <p>No hay comentarios aún.</p>
                      )}
                    </div>
                    <Input.TextArea
                      id={`comment-input-${trainer.id}`}
                      rows={2}
                      placeholder="Escribe un comentario..."
                    />
                    <Button
                      type="primary"
                      onClick={() => {
                        const commentInput = document.getElementById(`comment-input-${trainer.id}`);
                        if (commentInput && commentInput.value) {
                          handleComment(trainer.id, commentInput.value);
                          commentInput.value = '';
                        }
                      }}
                      style={{ marginTop: '10px' }}
                    >
                      Añadir Comentario
                    </Button>
                  </div>
                }
                title="Comentarios"
                trigger="click"
              >
                <Button icon={<MessageOutlined />} key="comment-popover">
                  Comentar
                </Button>
              </Popover>,
              currentTrainerId === trainer.id ? (
                <Popconfirm
                  title="¿Deseas cambiar de entrenador?"
                  onConfirm={() => deselectTrainer(trainer.id)}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button type="primary" danger>
                    Cambiar
                  </Button>
                </Popconfirm>
              ) : (
                <Button type="primary" onClick={() => selectTrainer(trainer.id)}>
                  Seleccionar
                </Button>
              ),
            ]}
            extra={
              <Avatar
                size={100}
                src={trainer?.img ? trainer.img : '/face.jpg'}
                alt="Imagen del entrenador"
              />
            }
          >
            <List.Item.Meta
              avatar={<Avatar src={trainer?.img || '/face.jpg'} />}
              title={trainer.username || 'Entrenador Anónimo'}
              description={trainer.specialty || 'Entrenador Personal'}
            />
            {trainer.bio
              ? trainer.bio
              : 'Experto en fitness y bienestar, dedicado a ayudarte a alcanzar tus metas.'}
          </List.Item>
        );
      }}
    />
  );
};

export default TrainersList;
