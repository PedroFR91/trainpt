import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import styles from '../../../styles/myprofile.module.css';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import Modal from '../../../components/trainer/Modal';
import AddTextClient from '../../../components/client/addTextClient';
import MyRatesClient from '../../../components/client/myRatesClient';
const Mytrainer = () => {
    const router = useRouter();
    const { mytrainer } = router.query;
    const [userData, setUserData] = useState(null);
    const [rates, setRates] = useState([]);

    useEffect(() => {
        // Consultar los datos del entrenador (userData)
        const userQuery = query(
            collection(db, "users"),
            where("id", "==", mytrainer)
        );

        const unsubUser = onSnapshot(
            userQuery,
            (userSnapshot) => {
                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    const userDocData = userDoc.data();
                    setUserData(userDocData);
                }
            },
            (error) => {
                console.log("Error al consultar el usuario:", error);
            }
        );

        // Consultar las tarifas (rates)
        const ratesQuery = query(
            collection(db, "rates"),
            where("rateid", "==", mytrainer)
        );

        const unsubRates = onSnapshot(
            ratesQuery,
            (ratesSnapshot) => {
                let ratesList = [];
                ratesSnapshot.docs.forEach((rateDoc) => {
                    ratesList.push({ id: rateDoc.id, ...rateDoc.data() });
                });
                setRates(ratesList);
            },
            (error) => {
                console.log("Error al consultar las tarifas:", error);
            }
        );

        return () => {
            unsubUser();
            unsubRates();
        };
    }, [mytrainer]);

    return (
        <div className={styles.containerProfile}>
            <div className={styles.layout}>
                <div className={styles.myprofile}>
                    <img
                        src={userData?.img ? userData.img : "/face.jpg"}
                        alt={"img"}
                        className={styles.myprofileimg}
                    />

                    <h2>{userData?.username}</h2>
                    <div className={styles.myprofileinfo}>
                        <AddTextClient initialText={userData?.mytext} />
                    </div>
                </div>
                <div className={styles.subdivision}>
                    <MyRatesClient rates={rates} />
                </div>
            </div>
        </div>
    );
};

export default Mytrainer;
