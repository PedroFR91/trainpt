import React, { useContext, useEffect, useState } from 'react'
import styles from './form.module.css'

const form = () => {
    const [form, setForm] = useState([]);
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'forms'),
            (snapShot) => {
                let list = [];
                snapShot.docs.forEach((doc) => {
                    list.push({ id: doc.id, ...doc.data() });
                });
                setForm(list);
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
        <div className={styles.formSection}>Hola form {myData.id}</div>
    )
}

export default form