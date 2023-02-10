import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import styles from '../../styles/previousimg.module.css';
import AuthContext from '../../context/AuthContext';
import { collection, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
const photos = () => {
  const { myUid } = useContext(AuthContext);
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [type, setType] = useState('Frontal');
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'clientPhotos'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setPhotos(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);
  const handleDelete = async (id) => {
    console.log(id);
    try {
      await deleteDoc(doc(db, 'clientPhotos', id));
    } catch (error) {}
  };

  return (
    <div>
      <ClientHeader />
      <div className={styles.clientPhotos}>
        {photos
          .filter((data) => data.trainerId === myUid)
          .map((photo) => (
            <div key={photo.id}>
              <div className={styles.clientImg}>
                <img src={photo.img} alt={photo.title} />
                <p>{photo.type}</p>
              </div>
              <button onClick={() => handleDelete(photo.id)}>Borrar</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default photos;
