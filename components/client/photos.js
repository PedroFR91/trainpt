import React, { useEffect, useState } from 'react';
import styles from '../../styles/previousimg.module.css';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import the necessary Firestore functions
import { db } from '../../firebase.config';

const Photos = ({ clientId }) => {

    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        // Define a query to retrieve documents with the matching 'clientId'
        const q = query(collection(db, 'forms'), where('clientId', '==', clientId));

        getDocs(q)
            .then((querySnapshot) => {
                const photoList = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Check if 'front', 'lateral', and 'back' exist in the document
                    if (data.front && data.lateral && data.back && data.timeStamp) {
                        // Push the URLs into the photoList array
                        photoList.push({
                            front: data.front,
                            lateral: data.lateral,
                            back: data.back,
                            date: data.timeStamp
                        });
                    }
                });
                // Set the retrieved photoList to the 'photos' state
                setPhotos(photoList);
            })
            .catch((error) => {
                console.error('Error getting documents: ', error);
            });
    }, [clientId]);

    return (
        <div className={styles.myphotos}>
            <h1>Fotos</h1>
            {photos.map((photo, index) => (
                <div key={index} className={styles.formphotos}>
                    <div className={styles.formdate}>
                        <p>{photo.date.toDate().toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        })}</p>
                    </div>
                    <div className={styles.formphoto}>
                        <div>
                            <img src={photo.front} alt="Front" height={'90%'} />
                            <p>Frente</p>
                        </div>
                        <div>
                            <img src={photo.lateral} alt="Lateral" height={'90%'} />
                            <p>Lateral</p>
                        </div>
                        <div>
                            <img src={photo.back} alt="Back" height={'90%'} />
                            <p>Espalda</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Photos;
