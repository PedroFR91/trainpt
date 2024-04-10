import React, { useEffect, useState } from 'react'
import styles from "../../styles/files.module.css";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { FaFilePdf } from 'react-icons/fa';
const MyDiet = ({ myUid }) => {
    const [myfiles, setMyFiles] = useState([]);
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
                console.log(error);
            }
        );
        return () => {
            unsub();
        };
    }, []);
    return (
        <div className={styles.gallery}>

            {myfiles.length > 0 ? (
                myfiles.map((item) => (
                    <div key={item.id}>


                        <p>{item.title ? item.title : "Sin título"}</p>
                        <a href={item.img} target="_blank">
                            Ver/Descargar
                        </a>


                    </div>
                ))
            ) : (
                <h1>No tienes archvivos de dieta</h1>
            )}
        </div>
    )
}

export default MyDiet