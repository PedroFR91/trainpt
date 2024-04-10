import React, { useEffect, useState } from 'react';
import Slider from 'react-slick'; // Importa Slider
import 'slick-carousel/slick/slick.css'; // Importa estilos predeterminados
import 'slick-carousel/slick/slick-theme.css'; // Importa tema opcional
import styles from '../../styles/previousimg.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { Carousel } from 'antd';
const contentStyle = {
    margin: 0,
    height: '160px',
    color: '#fff',
    lineHeight: '160px',
    textAlign: 'center',
    background: '#364d79',
};
const MyPhotos = ({ myUid }) => {
    const [photos, setPhotos] = useState([]);
    const [fullscreen, setFullscreen] = useState(false);
    const onChange = (currentSlide) => {
        console.log(currentSlide);
    };

    useEffect(() => {
        const q = query(collection(db, 'forms'), where('clientId', '==', myUid));
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
                            date: data.timeStamp
                        });
                    }
                });
                setPhotos(photoList);
            })
            .catch((error) => {
                console.error('Error getting documents: ', error);
            });
    }, [myUid]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
    };

    return (
        <div className={styles.myphotos}>
            <h3>Mis Fotos</h3>
            {photos.map((photo, index) => (
                <div key={index} className={styles.formphotos}>
                    <div className={styles.formdate}>
                        <p>{photo.date.toDate().toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}</p>
                    </div>
                    <Carousel afterChange={onChange}>

                        <div>
                            <img src={photo.front} alt="Front" style={{ width: '100%' }} />
                            <p>Frente</p>
                        </div>
                        <div>
                            <img src={photo.lateral} alt="Lateral" style={{ width: '100%' }} />
                            <p>Lateral</p>
                        </div>
                        <div>
                            <img src={photo.back} alt="Back" style={{ width: '100%' }} />
                            <p>Espalda</p>
                        </div>

                    </Carousel>
                </div>
            ))}
        </div>
    );
}

export default MyPhotos;
