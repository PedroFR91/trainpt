import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const handleGoogleSignIn = async (auth, db, router) => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;

        // Verificar si el usuario ya existe en Firestore
        const userDocRef = doc(db, "users", user.uid);
        const existingUserDoc = await getDoc(userDocRef);

        if (existingUserDoc.exists()) {
            const existingUserData = existingUserDoc.data();
            const collectionName = existingUserData.role === 'trainer' ? 'trainers' : 'clients';
            const userCollectionDocRef = doc(db, collectionName, user.uid);
            const userCollectionSnapshot = await getDoc(userCollectionDocRef);

            if (!userCollectionSnapshot.exists()) {
                // Si el usuario no existe en la colección correspondiente, crearlo
                const newUserData = {
                    id: user.uid,
                    email: user.email,
                    username: user.displayName,
                    role: existingUserData.role,
                    img: user.photoURL,
                    timeStamp: serverTimestamp(),
                    googleLinked: true,
                };
                await setDoc(userCollectionDocRef, newUserData);
            }

            router.push("/dashboard");
        } else {
            // Si el usuario no existe en la colección 'users', procede como antes
            return { message: "Seleccione su rol", user };
        }
    } catch (error) {
        console.error("Error en la autenticación con Google:", error);
        throw error;
    }
};


export const createGoogleUser = async (auth, db, user, selectedRole, router) => {
    try {
        // Crear un nuevo usuario en Firestore con el rol seleccionado
        const collectionName = selectedRole === 'trainer' ? 'trainers' : 'clients';
        const newUserDocRef = doc(db, collectionName, user.uid);

        const newUserData = {
            id: user.uid,
            email: user.email,
            username: user.displayName,
            role: selectedRole,
            img: user.photoURL,
            timeStamp: serverTimestamp(),
            googleLinked: true,
        };
        await setDoc(newUserDocRef, newUserData);

        // También guardar los datos básicos en la colección 'users' para referencia general
        const usersDocRef = doc(db, 'users', user.uid);
        await setDoc(usersDocRef, {
            role: selectedRole,
        });

        router.push("/dashboard");
    } catch (error) {
        console.error("Error al crear el usuario en Firestore:", error);
        throw error;
    }
};

// services/authService.js

export const handleEmailLogin = async (auth, db, email, password, router) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        const userData = userSnapshot.data();

        if (userData && userData.role) {
            const collectionName = userData.role === 'trainer' ? 'trainers' : 'clients';
            const userCollectionDocRef = doc(db, collectionName, user.uid);
            const userCollectionSnapshot = await getDoc(userCollectionDocRef);

            if (!userCollectionSnapshot.exists()) {
                // Si el usuario no existe en la colección correspondiente, crearlo
                const newUserData = {
                    id: user.uid,
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0],
                    role: userData.role,
                    timeStamp: serverTimestamp(),
                    googleLinked: false,
                };
                await setDoc(userCollectionDocRef, newUserData);
            }

            router.push("/dashboard");
        } else {
            throw new Error("No se encontraron datos del usuario.");
        }
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
    }
};


export const handleEmailRegister = async (auth, db, email, password, userName, selectedRole, router) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        const collectionName = selectedRole === 'trainer' ? 'trainers' : 'clients';
        const newUserDocRef = doc(db, collectionName, user.uid);

        const newUserData = {
            id: user.uid,
            email: email,
            username: userName,
            role: selectedRole,
            timeStamp: serverTimestamp(),
            googleLinked: false,
        };
        await setDoc(newUserDocRef, newUserData);


        router.push("/dashboard");
    } catch (error) {
        console.error("Error en el registro:", error);
        throw error;
    }
};