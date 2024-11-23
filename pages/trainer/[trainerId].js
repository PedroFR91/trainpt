// pages/trainer/[trainerId].js
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Row, Col, Card, Typography } from 'antd';
import { HeartOutlined, StarOutlined, FacebookOutlined, TwitterOutlined, InstagramOutlined } from '@ant-design/icons';
import { getDocument, listenToSubcollection } from '../../services/firebase';
import ProfileCard from '../../components/trainer/ProfileCard';
import RatesCard from '../../components/trainer/RatesCard';

const { Title, Text } = Typography;
=======

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, Avatar, Rate, List, Button } from 'antd';
import { LikeOutlined, StarOutlined, MessageOutlined } from '@ant-design/icons';
import { getDocument } from '../../services/firebase';
import styles from '../../styles/trainerhome.module.css';
>>>>>>> 62724d042d6e23a6444ad590c8e6b063d9a4bb7d

const PublicTrainerProfile = () => {
    const router = useRouter();
    const { trainerId } = router.query;
    const [trainerData, setTrainerData] = useState(null);
    const [rates, setRates] = useState([]);
    const [likesCount, setLikesCount] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [comments, setComments] = useState([]);
    const [publicSections, setPublicSections] = useState({
        rates: true,
        socialMedia: true,
        comments: true,
    });

    useEffect(() => {
        if (trainerId) {
            fetchTrainerData();
            fetchTrainerRates();
        }
    }, [trainerId]);

    const fetchTrainerData = async () => {
        const trainerDoc = await getDocument('trainers', trainerId);
        if (trainerDoc) {
            setTrainerData(trainerDoc);
            setLikesCount(trainerDoc.likes?.length || 0);
            const ratings = trainerDoc.ratings || [];
            setAverageRating(
                ratings.length > 0
                    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
                    : 0
            );
            setComments(trainerDoc.comments || []);
            setPublicSections(trainerDoc.publicSections || {});
        }
    };

    const fetchTrainerRates = () => {
        const unsub = listenToSubcollection(
            'trainers',
            trainerId,
            'rates',
            [],
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setRates(list);
            },
            (error) => console.error('Error fetching rates: ', error)
        );
        return () => unsub();
    };

    if (!trainerData) {
        return <p>Entrenador no encontrado</p>;
    }

    return (
        <Row style={{ minHeight: '100vh', padding: '16px' }} gutter={[16, 16]}>
            {/* Tarifas */}
            <Col xs={24} md={8}>
                <RatesCard rates={rates} publicView />
            </Col>

            {/* Perfil */}
            <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ height: '90vh', width: '100%', maxWidth: '400px' }}>
                    <ProfileCard
                        profileData={trainerData}
                        likesCount={likesCount}
                        averageRating={averageRating}
                        comments={comments}
                    />
                </div>
            </Col>

            {/* Métricas */}
            <Col xs={24} md={8}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card hoverable style={{ textAlign: 'center' }}>
                            <HeartOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />
                            <Title level={4}>{likesCount}</Title>
                            <Text>Me gusta</Text>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card hoverable style={{ textAlign: 'center' }}>
                            <StarOutlined style={{ fontSize: '48px', color: '#faad14' }} />
                            <Title level={4}>{averageRating}</Title>
                            <Text>Valoración promedio</Text>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title="Redes Sociales" hoverable style={{ textAlign: 'center' }}>
                            <a href={trainerData.instagram} target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>
                                <InstagramOutlined style={{ fontSize: '36px', color: '#e4405f' }} />
                            </a>
                            <a href={trainerData.twitter} target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>
                                <TwitterOutlined style={{ fontSize: '36px', color: '#1da1f2' }} />
                            </a>
                            <a href={trainerData.facebook} target="_blank" rel="noopener noreferrer" style={{ margin: '0 8px' }}>
                                <FacebookOutlined style={{ fontSize: '36px', color: '#4267b2' }} />
                            </a>
                        </Card>
                    </Col>
                    <Col span={24}>
                        <Card title="Comentarios" hoverable>
                            {comments.length > 0 ? (
                                comments.map((comment, index) => (
                                    <Card key={index} style={{ marginBottom: '8px' }}>
                                        <Text>{comment.comment}</Text>
                                    </Card>
                                ))
                            ) : (
                                <Text>No hay comentarios aún.</Text>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Col>



        </Row>
    );
};

export default PublicTrainerProfile;
