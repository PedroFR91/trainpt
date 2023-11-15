import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.config";
import { useState } from "react";


export default function getChat(chatId) {
    const q = query(
        collection(db, 'chats'),
        orderBy('timeStamp'), // Ordenamos los mensajes por timeStamp
        limit(20) // Limitamos a los últimos 20 mensajes
    );

    const unsubscribe = onSnapshot(q, (snapShot) => {
        let list = [];
        snapShot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
        });
        setMyChat(list);
        scrollToBottom()
    });

    return () => {
        unsubscribe();
    };
}
