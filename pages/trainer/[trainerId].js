// pages/trainer/[trainerId].js

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Avatar, Rate, List, Button } from 'antd';
import { LikeOutlined, StarOutlined, MessageOutlined } from '@ant-design/icons';
import { getDocument } from '../../services/firebase';
import styles from '../../styles/trainerhome.module.css';

const PublicTrainerProfile = () => {
    const router = useRouter();
    const { trainerId } = router.query;
    const [trainerData, setTrainerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (trainerId) {
            fetchTrainerData();
        }
    }, [trainerId]);

    const fetchTrainerData = async () => {
        const trainerDoc = await getDocument('trainers', trainerId);
        if (trainerDoc) {
            const likesCount = trainerDoc.likes ? trainerDoc.likes.length : 0;
            const ratings = trainerDoc.ratings || [];
            const averageRating =
                ratings.length > 0
                    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
                    : 0;
            const comments = trainerDoc.comments || [];
            setTrainerData({ ...trainerDoc, likesCount, averageRating, comments });
        }
        setLoading(false);
    };

    if (loading) {
        return <p>Cargando...</p>;
    }

    if (!trainerData) {
        return <p>Entrenador no encontrado.</p>;
    }

    return (
        <div className={styles.profileContainer}>
            <Card className={styles.profileCard} hoverable>
                <div
                    className={styles.coverContainer}
                    style={{
                        backgroundImage: `url(${trainerData.background || '/default-background.jpg'})`,
                    }}
                >
                    {/* Sin opción de cambiar el fondo */}
                </div>
                <div className={styles.contentContainer}>
                    <Avatar size={100} src={trainerData.img ? trainerData.img : '/face.jpg'} />
                    <h2 className={styles.username}>{trainerData.username}</h2>
                    {/* Mostrar likes, ratings y comentarios */}
                    <div className={styles.socialStats}>
                        <div>
                            <LikeOutlined /> {trainerData.likesCount} Me gusta
                        </div>
                        <div>
                            <StarOutlined /> {trainerData.averageRating} Valoración promedio
                        </div>
                    </div>
                    <div className={styles.commentsSection}>
                        <h3>Comentarios de los clientes</h3>
                        {trainerData.comments.length > 0 ? (
                            <List
                                dataSource={trainerData.comments}
                                renderItem={(item, index) => (
                                    <List.Item key={index}>
                                        <MessageOutlined /> {item.comment}
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <p>No hay comentarios aún.</p>
                        )}
                    </div>
                    {/* Botón para registrarse como cliente */}
                    <Button type="primary" href="/login">
                        Crear cuenta y contactar
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PublicTrainerProfile;
