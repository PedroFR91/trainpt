// components/client/MyDiet.js
import React, { useEffect, useState } from 'react';
import { Card, Button, Empty } from 'antd';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { FaFilePdf } from 'react-icons/fa';
import styles from "../../styles/files.module.css";

const MyDiet = ({ myUid }) => {
    const [myFiles, setMyFiles] = useState([]);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "files"),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setMyFiles(list);
            },
            (error) => {
                console.error(error);
            }
        );
        return () => {
            unsub();
        };
    }, []);

    return (
        <div className={styles.dietGallery}>
            {myFiles.length > 0 ? (
                myFiles.map((item) => (
                    <Card
                        key={item.id}
                        hoverable
                        style={{ width: 300, margin: '10px' }}
                        cover={
                            <FaFilePdf size={50} style={{ color: '#ff4d4f', margin: '20px auto', display: 'block' }} />
                        }
                        actions={[
                            <Button type="primary" href={item.img} target="_blank">
                                Ver/Descargar
                            </Button>,
                        ]}
                    >
                        <Card.Meta title={item.title ? item.title : "Sin título"} />
                    </Card>
                ))
            ) : (
                <Empty description="No tienes archivos de dieta" />
            )}
        </div>
    );
};

export default MyDiet;
