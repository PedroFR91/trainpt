// services/firebase.js

import { db, storage } from '../firebase.config';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
} from 'firebase/firestore';
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from 'firebase/storage';

// Funciones para colecciones y documentos

export const addDocument = async (collectionName, data) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            timeStamp: serverTimestamp(),
        });
        return docRef;
    } catch (error) {
        console.error('Error al agregar documento:', error);
        throw error;
    }
};

export const setDocument = async (collectionName, docId, data) => {
    try {
        await setDoc(doc(db, collectionName, docId), {
            ...data,
            timeStamp: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error al establecer documento:', error);
        throw error;
    }
};

export const updateDocument = async (collectionName, docId, data) => {
    try {
        await updateDoc(doc(db, collectionName, docId), data);
    } catch (error) {
        console.error('Error al actualizar documento:', error);
        throw error;
    }
};

export const deleteDocument = async (collectionName, docId) => {
    try {
        await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        throw error;
    }
};

export const getDocument = async (collectionName, docId) => {
    try {
        const docSnap = await getDoc(doc(db, collectionName, docId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener documento:', error);
        throw error;
    }
};

export const getCollection = (collectionName, whereClauses = []) => {
    const colRef = collection(db, collectionName);
    let q = colRef;
    if (whereClauses.length > 0) {
        q = query(colRef, ...whereClauses);
    }
    return q;
};

export const listenToCollection = (collectionName, whereClauses, callback, errorCallback) => {
    const q = getCollection(collectionName, whereClauses);
    return onSnapshot(q, callback, errorCallback);
};

export const listenToDocument = (collectionName, docId, callback, errorCallback) => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, callback, errorCallback);
};

// Funciones para subcolecciones

export const addSubcollectionDocument = async (parentCollection, parentDocId, subcollectionName, data) => {
    try {
        const subcollectionRef = collection(db, parentCollection, parentDocId, subcollectionName);
        const docRef = await addDoc(subcollectionRef, {
            ...data,
            timeStamp: serverTimestamp(),
        });
        return docRef;
    } catch (error) {
        console.error('Error al agregar documento a subcolección:', error);
        throw error;
    }
};

export const updateSubcollectionDocument = async (parentCollection, parentDocId, subcollectionName, docId, data) => {
    try {
        const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error('Error al actualizar documento en subcolección:', error);
        throw error;
    }
};

export const deleteSubcollectionDocument = async (parentCollection, parentDocId, subcollectionName, docId) => {
    try {
        const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error al eliminar documento de subcolección:', error);
        throw error;
    }
};

export const listenToSubcollection = (parentCollection, parentDocId, subcollectionName, whereClauses, callback, errorCallback) => {
    const subcollectionRef = collection(db, parentCollection, parentDocId, subcollectionName);
    let q = subcollectionRef;
    if (whereClauses && whereClauses.length > 0) {
        q = query(subcollectionRef, ...whereClauses);
    }
    return onSnapshot(q, callback, errorCallback);
};

export const listenToSubcollectionDocument = (parentCollection, parentDocId, subcollectionName, docId, callback, errorCallback) => {
    console.log('parentCollection:', parentCollection);
    console.log('parentDocId:', parentDocId);
    console.log('subcollectionName:', subcollectionName);
    console.log('docId:', docId);
    const docRef = doc(db, parentCollection, parentDocId, subcollectionName, docId);
    return onSnapshot(docRef, callback, errorCallback);
};

// Funciones de Storage

export const uploadFile = async (filePath, file) => {
    try {
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);
        await new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                null,
                reject,
                resolve
            );
        });
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error al subir archivo:', error);
        throw error;
    }
};
