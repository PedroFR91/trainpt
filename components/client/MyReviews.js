// components/client/MyReviews.js
import React, { useEffect, useState } from 'react';
import { List, Avatar, Modal, Button } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import styles from '../../styles/program.module.css';

const MyReviews = ({ myUid }) => {
    const [reviews, setReviews] = useState([
        {
            id: '1',
            date: '2024-11-05',
            description: 'Revisión mensual - Estado físico y progreso.',
            notes: 'Buen progreso, mantener la dieta y ejercicios.',
            clientId: myUid, // Aseguramos que coincida con el cliente actual
        },
        {
            id: '2',
            date: '2024-12-05',
            description: 'Revisión bimensual - Seguimiento de medidas.',
            notes: 'Leve aumento en fuerza y resistencia.',
            clientId: myUid,
        },
        {
            id: '3',
            date: '2025-01-10',
            description: 'Control de peso y ajuste de rutina.',
            notes: 'Ajustar rutina de ejercicios para incluir más cardio.',
            clientId: myUid,
        },
    ]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const showReviewDetails = (review) => {
        setSelectedReview(review);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setSelectedReview(null);
        setIsModalVisible(false);
    };

    return (
        <div className={styles.reviewsSection}>
            <List
                itemLayout="horizontal"
                dataSource={reviews}
                renderItem={(review) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<CalendarOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                            title={<Button type="link" onClick={() => showReviewDetails(review)}>{review.date}</Button>}
                            description={review.description || 'Sin descripción'}
                        />
                    </List.Item>
                )}
            />

            <Modal
                title={`Detalles de la Revisión - ${selectedReview?.date}`}
                visible={isModalVisible}
                onCancel={closeModal}
                footer={[
                    <Button key="close" onClick={closeModal}>
                        Cerrar
                    </Button>,
                ]}
            >
                <p><strong>Fecha:</strong> {selectedReview?.date}</p>
                <p><strong>Descripción:</strong> {selectedReview?.description}</p>
                <p><strong>Notas:</strong> {selectedReview?.notes || 'No hay notas adicionales.'}</p>
            </Modal>
        </div>
    );
};

export default MyReviews;
