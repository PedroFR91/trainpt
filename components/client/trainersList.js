// components/client/trainersList.js
import React, { useState, useEffect, useContext } from 'react';
import { Avatar, List, Button, Popconfirm, message, Space, Input, Rate, Popover } from 'antd';
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { collection, onSnapshot, query, where, setDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
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
    const unsub = onSnapshot(collection(db, 'users'), (snapShot) => {
      const list = snapShot.docs
        .filter(doc => doc.data().role === 'trainer')
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          likes: Math.floor(Math.random() * 200), // Mockeado para ejemplo
          comments: [], // Mockeado para ejemplo
          rating: (Math.random() * 5).toFixed(1), // Mockeado para ejemplo
          userRating: 0, // Valoración del usuario (mock)
        }));
      setTrainers(list);
    }, (error) => {
      console.error(error);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'subscriptions'), where('clientId', '==', myUid));
    getDocs(q).then(querySnapshot => {
      if (!querySnapshot.empty) {
        const subscriptionData = querySnapshot.docs[0].data();
        setCurrentTrainerId(subscriptionData.trainerId);
      } else {
        setCurrentTrainerId(null);
      }
    }).catch(error => {
      console.error("Error fetching subscription: ", error);
    });
  }, [myUid]);

  const handleLike = (trainerId) => {
    setTrainers((prevTrainers) =>
      prevTrainers.map((trainer) =>
        trainer.id === trainerId ? { ...trainer, likes: trainer.likes + 1 } : trainer
      )
    );
    message.success("¡Has dado 'Me gusta' a este entrenador!");
  };

  const handleRating = (trainerId, value) => {
    setTrainers((prevTrainers) =>
      prevTrainers.map((trainer) =>
        trainer.id === trainerId ? { ...trainer, userRating: value } : trainer
      )
    );
    message.success(`Has calificado con ${value} estrellas a este entrenador.`);
  };

  const handleComment = (trainerId, comment) => {
    setTrainers((prevTrainers) =>
      prevTrainers.map((trainer) =>
        trainer.id === trainerId
          ? { ...trainer, comments: [...trainer.comments, comment] }
          : trainer
      )
    );
    message.success("Comentario agregado correctamente");
  };

  const selectTrainer = async (trainerId) => {
    if (currentTrainerId) {
      const confirm = window.confirm("Ya tienes un entrenador seleccionado. ¿Quieres cambiar de entrenador? Esto cancelará tu suscripción actual.");
      if (!confirm) return;
      await deselectTrainer(currentTrainerId);
    }
    await setDoc(doc(collection(db, 'subscriptions')), {
      clientId: myUid,
      trainerId: trainerId,
      status: "active"
    });
    setCurrentTrainerId(trainerId);
    message.success('Entrenador seleccionado correctamente');
  };

  const deselectTrainer = async (trainerId) => {
    const q = query(collection(db, 'subscriptions'), where('clientId', '==', myUid), where('trainerId', '==', trainerId));
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
      renderItem={(trainer) => (
        <List.Item
          key={trainer.id}
          actions={[
            <IconText icon={StarOutlined} text={trainer.rating} key="rating" />,
            <Button
              icon={<LikeOutlined />}
              onClick={() => handleLike(trainer.id)}
              key="like-button"
            >
              {trainer.likes}
            </Button>,
            <Popover
              content={
                <Rate
                  allowHalf
                  defaultValue={trainer.userRating}
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
                    {trainer.comments.length > 0 ? (
                      <List
                        dataSource={trainer.comments}
                        renderItem={(comment, index) => (
                          <List.Item key={index}>
                            <MessageOutlined /> {comment}
                          </List.Item>
                        )}
                        size="small"
                      />
                    ) : (
                      <p>No hay comentarios aún.</p>
                    )}
                  </div>
                  <Input.TextArea
                    rows={2}
                    placeholder="Escribe un comentario..."
                    onPressEnter={(e) => {
                      handleComment(trainer.id, e.target.value);
                      e.target.value = ""; // Limpiar el campo después de enviar el comentario
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      const commentInput = document.getElementById(`comment-input-${trainer.id}`);
                      if (commentInput && commentInput.value) {
                        handleComment(trainer.id, commentInput.value);
                        commentInput.value = "";
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
                title="¿Cambiar entrenador?"
                onConfirm={() => deselectTrainer(trainer.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button type="primary" danger>Cambiar</Button>
              </Popconfirm>
            ) : (
              <Button type="primary" onClick={() => selectTrainer(trainer.id)}>
                Seleccionar
              </Button>
            )
          ]}
          extra={
            <Avatar
              size={100}
              src={trainer.img ? trainer.img : '/face.jpg'}
              alt="Imagen del entrenador"
            />
          }
        >
          <List.Item.Meta
            avatar={<Avatar src={trainer.img || '/face.jpg'} />}
            title={trainer.username || 'Entrenador Anónimo'}
            description={trainer.specialty || 'Entrenador Personal'}
          />
          {trainer.description || 'Experto en fitness y bienestar, dedicado a ayudarte a alcanzar tus metas.'}
        </List.Item>
      )}
    />
  );
};

export default TrainersList;
