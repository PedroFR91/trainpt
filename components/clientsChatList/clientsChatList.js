import React, { useContext, useEffect, useState } from "react";
import styles from "./clientsChatList.module.css";
import { collection, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import Link from "next/link";

const UserList = ({ myUid }) => {
    const { setSelectedClientId, selectedClientId } = useContext(AuthContext); // Suponiendo que setSeleectedClientId se gestiona aquí
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "subscriptions"), where("trainerId", "==", myUid));
        const unsub = onSnapshot(q, (querySnapshot) => {
            const clientIds = querySnapshot.docs.map((doc) => doc.data().clientId);

            if (clientIds.length > 0) {
                const clientsQuery = query(collection(db, "users"), where("id", "in", clientIds));
                onSnapshot(clientsQuery, (clientsSnapshot) => {
                    const clientsData = clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setClients(clientsData);
                });
            }
        });

        return () => unsub();
    }, [myUid]);

    const handleOpenChat = async (clientId) => {

        // Componer el ID del chat
        const chatId = `${myUid}_${clientId}`;
        const chatDocRef = doc(db, 'chats', chatId);
        console.log(chatId)
        // Comprobar si existe un chat
        const chatDocSnap = await getDoc(chatDocRef);
        if (!chatDocSnap.exists()) {
            // Crear un nuevo chat si no existe
            await setDoc(chatDocRef, {
                messages: [],
                createdAt: serverTimestamp(),
            });
        }

        // Actualizar el ID del cliente seleccionado
        setSelectedClientId(clientId);
    };

    return (
        <div className={styles.container}>
            {clients.map((client) => (
                <div key={client.id} className={styles.userdata}>
                    <div>
                        <img src={client.img || "/face.jpg"} alt={"myprofileimg"} />
                        <div>{client.username}</div>
                    </div>

                    <button className={styles.spanbutton} onClick={() => handleOpenChat(client.id)}>Abrir Chat</button>

                    <Link href={`/shared/clients/${client.id}`}>
                        <button className={styles.spanbutton}>Info</button>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default UserList;
