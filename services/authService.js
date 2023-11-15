import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, linkWithPopup, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const handleGoogleSignIn = async (auth, provider, db, selectedRole, router) => {
    const res = await signInWithPopup(auth, provider);
    const user = res.user;

    // Verificar si el usuario ya tiene una cuenta con correo/contraseña
    const userDocRef = doc(db, "users", user.uid);
    const existingUserDoc = await getDoc(userDocRef);
    const existingUserData = existingUserDoc.data();

    if (existingUserData && existingUserData.email) {
        // Actualizar datos del usuario si ya existe
        const updatedUserData = {
            ...existingUserData,
            googleLinked: true,
        };
        await setDoc(userDocRef, updatedUserData);
        router.push(selectedRole === "trainer" ? "/trainer/home" : "/client/program");
        return { message: "Cuenta actualizada para acceso con Google." };
    } else {
        // Crear un nuevo usuario en Firestore
        const newUserData = {
            id: user.uid,
            email: user.email,
            username: user.displayName,
            role: selectedRole,
            img: user.photoURL,
            timeStamp: serverTimestamp(),
            googleLinked: true,
        };
        await setDoc(userDocRef, newUserData);
        router.push(selectedRole === "trainer" ? "/trainer/home" : "/client/program");
        return { message: "Cuenta creada con acceso Google." };
    }
};

export const handleEmailLogin = async (auth, db, email, password, router) => {
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
};

export const handleEmailRegister = async (auth, provider, db, email, password, userName, selectedRole, router) => {
    const credential = EmailAuthProvider.credential(email, password);
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Enlazar la cuenta de correo/contraseña con la cuenta de Google existente
    if (auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);
        await linkWithPopup(auth.currentUser, provider);
    }

    // Crear un nuevo usuario en Firestore
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
};
