import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, linkWithPopup, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
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
            // Si el usuario ya existe, redirigir según su rol
            const existingUserData = existingUserDoc.data();
            router.push(existingUserData.role === "trainer" ? "/trainer/home" : "/client/program");
        } else {
            // Si el usuario no existe, muestra la selección de rol (cliente/entrenador)
            return { message: "Seleccione su rol", user }; // Devuelve el usuario autenticado y un mensaje para el frontend
        }
    } catch (error) {
        console.error("Error en la autenticación con Google:", error);
        throw error;
    }
};

export const createGoogleUser = async (auth, db, user, selectedRole, router) => {
    try {
        // Crear un nuevo usuario en Firestore con el rol seleccionado
        const newUserDocRef = doc(db, "users", user.uid);
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
        router.push(selectedRole === "trainer" ? "/trainer/home" : "/client/program");
    } catch (error) {
        console.error("Error al crear el usuario en Firestore:", error);
        throw error;
    }
};

export const handleEmailLogin = async (auth, db, email, password, router) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        const userDocRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        const userData = userSnapshot.data();

        if (userData && userData.role) {
            router.push(userData.role === "trainer" ? "/trainer/home" : "/client/program");
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

        const newUserDocRef = doc(db, "users", user.uid);
        const newUserData = {
            id: user.uid,
            email: email,
            username: userName,
            role: selectedRole,
            timeStamp: serverTimestamp(),
            googleLinked: false,
        };
        await setDoc(newUserDocRef, newUserData);
        router.push(selectedRole === "trainer" ? "/trainer/home" : "/client/program");
    } catch (error) {
        console.error("Error en el registro:", error);
        throw error;
    }
};
