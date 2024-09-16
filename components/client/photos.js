import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Card, Col, Row, Typography, Spin } from 'antd';
import { format } from 'date-fns';
import styles from '../../styles/previousimg.module.css';

const { Title, Text } = Typography;

const Photos = ({ clientId }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'forms'), where('clientId', '==', clientId));

        getDocs(q)
            .then((querySnapshot) => {
                const photoList = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.front && data.lateral && data.back && data.timeStamp) {
                        photoList.push({
                            front: data.front,
                            lateral: data.lateral,
                            back: data.back,
                            date: data.timeStamp.toDate(),
                        });
                    }
                });
                setPhotos(photoList);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error getting documents: ', error);
                setLoading(false);
            });
    }, [clientId]);

    if (loading) {
        return <Spin size="large" className={styles.loadingSpinner} />;
    }

    return (
        <div className={styles.myphotos}>
            <Title level={2}>Fotos</Title>
            <Row gutter={[16, 16]}>
                {photos.map((photo, index) => (
                    <Col key={index} xs={24} sm={12} md={8}>
                        <Card title={format(photo.date, 'dd/MM/yyyy')} bordered={false}>
                            <Row gutter={[16, 16]} justify="center">
                                <Col>
                                    <img src={photo.front} alt="Front" className={styles.photo} />
                                    <Text>Frente</Text>
                                </Col>
                                <Col>
                                    <img src={photo.lateral} alt="Lateral" className={styles.photo} />
                                    <Text>Lateral</Text>
                                </Col>
                                <Col>
                                    <img src={photo.back} alt="Back" className={styles.photo} />
                                    <Text>Espalda</Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Photos;
