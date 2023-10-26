import { React, useContext, useState } from "react";
import Image from "next/image";
import AuthContext from "../context/AuthContext";
import { useAuthUser } from "../hooks/useAuthUser";
import { useRouter } from "next/router";
import {
  signOut,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase.config";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import styles from "../styles/Home.module.css";

const provider = new GoogleAuthProvider();

const acceso = () => {
  useAuthUser();
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const { push } = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [selected, setSelected] = useState("trainer");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState('Pendiente')
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;

      // Verificar si el usuario ya ha iniciado sesión con correo/contraseña
      const existingUserDoc = await getDoc(doc(db, "users", user.uid));
      const existingUserData = existingUserDoc.data();
      if (existingUserData && existingUserData.email) {
        // El usuario ha iniciado sesión previamente con correo/contraseña
        // Asociar la cuenta de Google con la cuenta de correo/contraseña
        const updatedUserData = {
          ...existingUserData,
          googleLinked: true,
        };
        await setDoc(doc(db, "users", user.uid), updatedUserData);
        setMessage(
          "Ya has accedido con correo y contraseña. Ahora puedes acceder con Google también."
        );
      } else {
        // El usuario está iniciando sesión con Google por primera vez
        // Crear un nuevo registro en Firestore
        const userData = {
          id: user.uid,
          email: user.email,
          username: user.displayName,
          role: selected,
          status: status,
          img: user.photoURL,
          timeStamp: serverTimestamp(),
          googleLinked: true,
        };
        await setDoc(doc(db, "users", user.uid), userData);
      }
      if (selected === "trainer") {
        push("/trainer/home");
      } else {
        push("/client/program");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Consultar el documento del usuario en Firestore
      const userDoc = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();

      if (userData && userData.role) {
        // Redireccionar al usuario según su rol
        if (userData.role === "trainer") {
          push("/trainer/home");
        } else {
          push("/client/program");
        }

        // Consultar el campo "googleLinked" en Firestore y mostrar el mensaje si es necesario
        if (userData.googleLinked) {
          setMessage(
            "Ya has accedido con Google. Ahora puedes acceder con correo y contraseña también."
          );
        }
      }
    } catch (error) {
      setError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Verificar que todos los campos estén completos
    if (!email || !password || !userName) {
      setError(true);
      return;
    }

    try {
      // Verificar si el correo ya está en uso en Firebase Authentication
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Enlazar la cuenta de correo/contraseña con la cuenta de Google existente
      await linkWithPopup(auth.currentUser, provider);

      // Redirigir al usuario según su rol
      if (selected === "trainer") {
        push("/trainer/home");
      } else {
        push("/client/program");
      }
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  return (
    <div className={styles.acceso}>
      <video
        src="/backgroundtwo.mp4"
        autoPlay
        loop
        muted
        style={{
          position: "fixed",
          width: "100%",
          left: "50%",
          top: "50%",
          height: "100%",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          zIndex: "-10",
        }}
      />
      {toggleView ? (
        <div>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Nombre"
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Correo"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="trainer">Entrenador</option>
              <option value="client">Cliente</option>
            </select>
            <button type="submit">Crear cuenta</button>
            <div
              style={{
                border: "none",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <hr style={{ width: "30%" }}></hr>
              <span>ó</span>
              <hr style={{ width: "30%" }}></hr>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              <Image
                src={"/google.png"}
                alt={"google image for login"}
                width={55}
                height={40}
              />
              <p>Accede con Google</p>
            </button>
          </form>
        </div>
      ) : (
        <div>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Acceder</button>
            <div
              style={{
                border: "none",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <hr style={{ width: "30%" }}></hr>
              <span>ó</span>
              <hr style={{ width: "30%" }}></hr>
            </div>

            <div onClick={signInWithGoogle}>
              <Image
                src={"/google.png"}
                alt={"google image for login"}
                width={55}
                height={40}
              />
              <p>Accede con Google</p>
            </div>
          </form>
        </div>
      )}
      <div className={styles.toggleButton}>
        <div onClick={() => setToggleView(!toggleView)}>
          {toggleView
            ? "¿Estás registrado?, accede"
            : "¿No tienes cuenta?, creala"}
        </div>
      </div>
    </div>
  );
};

export default acceso;
