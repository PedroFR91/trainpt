'use client'
import React, { useEffect, useState, useRef } from 'react';
import { Card, Carousel, Empty, Select, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import styles from '../../styles/program.module.css';

const { Option } = Select;

const MyPhotos = ({ myUid }) => {
    const [photos, setPhotos] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [filteredPhotos, setFilteredPhotos] = useState(null);
    const carouselRef = useRef(null); // Referencia para controlar el Carousel

    useEffect(() => {
        // Datos mockeados con las imágenes proporcionadas
        const mockData = [
            {
                date: '2024-10-01',
                images: {
                    front: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=600',
                    lateral: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600',
                    back: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=600'
                },
            },
            {
                date: '2024-11-01',
                images: {
                    front: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=600',
                    lateral: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600',
                    back: 'https://images.pexels.com/photos/136404/pexels-photo-136404.jpeg?auto=compress&cs=tinysrgb&w=600'
                },
            },
            {
                date: '2024-12-01',
                images: {
                    front: 'https://via.placeholder.com/200?text=Frente',
                    lateral: 'https://via.placeholder.com/200?text=Lateral',
                    back: 'https://via.placeholder.com/200?text=Espalda'
                },
            },
        ];

        setPhotos(mockData);
        setSelectedDate(mockData[0].date); // Fecha inicial seleccionada
    }, [myUid]);

    useEffect(() => {
        // Filtrar las fotos según la fecha seleccionada
        if (selectedDate) {
            const selectedPhotos = photos.find(photoSet => photoSet.date === selectedDate);
            setFilteredPhotos(selectedPhotos);
        }
    }, [selectedDate, photos]);

    const handleDateChange = (value) => {
        setSelectedDate(value);
    };

    const handlePrev = () => {
        carouselRef.current.prev();
    };

    const handleNext = () => {
        carouselRef.current.next();
    };

    return (
        <div className={styles.photoGallery}>
            {photos.length > 0 ? (
                <div

                    className={styles.photoCard}

                >
                    <Select
                        value={selectedDate}
                        onChange={handleDateChange}
                        style={{ width: '100%', marginBottom: '1rem' }}
                        placeholder="Selecciona una fecha"
                    >
                        {photos.map((photoSet, index) => (
                            <Option key={index} value={photoSet.date}>
                                {photoSet.date}
                            </Option>
                        ))}
                    </Select>

                    {filteredPhotos ? (
                        <div className={styles.carouselContainer}>
                            <Button
                                icon={<LeftOutlined />}
                                onClick={handlePrev}
                                className={styles.carouselButton}
                            />    <Button
                                icon={<RightOutlined />}
                                onClick={handleNext}
                                className={styles.carouselButton}
                            />
                            <Carousel
                                ref={carouselRef}
                                dotPosition="bottom"
                                className={styles.photoCarousel}
                            >
                                <div>
                                    <img src={filteredPhotos.images.front} alt="Frente" className={styles.carouselImage} />
                                    <p className={styles.imageCaption}>Frente</p>
                                </div>
                                <div>
                                    <img src={filteredPhotos.images.lateral} alt="Lateral" className={styles.carouselImage} />
                                    <p className={styles.imageCaption}>Lateral</p>
                                </div>
                                <div>
                                    <img src={filteredPhotos.images.back} alt="Espalda" className={styles.carouselImage} />
                                    <p className={styles.imageCaption}>Espalda</p>
                                </div>
                            </Carousel>

                        </div>
                    ) : (
                        <Empty description="No hay fotos disponibles para esta fecha" />
                    )}
                </div>
            ) : (
                <Empty description="No hay fotos disponibles" />
            )}
        </div>
    );
};

export default MyPhotos;
