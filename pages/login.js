import React, { useContext, useState } from "react";
import Image from "next/image";
import AuthContext from "../context/AuthContext";
import { useRouter } from "next/router";
import { auth, db } from "../firebase.config";
import { handleGoogleSignIn, handleEmailLogin, handleEmailRegister, createGoogleUser } from "../services/authService";
import styles from "../styles/Home.module.css";

const Acceso = () => {
  const { isLogged } = useContext(AuthContext);
  const [toggleView, setToggleView] = useState(true);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [selected, setSelected] = useState("trainer");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState(null);
  const [googleUser, setGoogleUser] = useState(null); // Estado para el usuario autenticado con Google

  // Dentro de la función signInWithGoogle
  const signInWithGoogle = async () => {
    try {
      const response = await handleGoogleSignIn(auth, db, router);
      if (response.message === "Seleccione su rol") {
        setGoogleUser(response.user);
        setMessage("Seleccione su rol para continuar");
      } else {
        router.push('/dashboard'); // Redirigir al dashboard después del inicio de sesión
      }
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  // Dentro de handleLogin y handleRegister
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await handleEmailLogin(auth, db, email, password, router);
      router.push('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !userName) {
      setError(true);
      return;
    }
    try {
      await handleEmailRegister(auth, db, email, password, userName, selected, router);
      router.push('/dashboard'); // Redirigir al dashboard
    } catch (error) {
      console.error(error);
      setError(true);
    }
  };


  const createGoogleUserWithRole = async (role) => {
    if (!googleUser) return;
    try {
      await createGoogleUser(auth, db, googleUser, role, router);
      setGoogleUser(null); // Limpia el estado después de crear el usuario
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
      {message && googleUser ? (
        <div>
          <p>{message}</p>
          <button onClick={() => createGoogleUserWithRole("trainer")}>
            Registrarse como Entrenador
          </button>
          <button onClick={() => createGoogleUserWithRole("client")}>
            Registrarse como Cliente
          </button>
        </div>
      ) : toggleView ? (
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
              onChange={(e) => setEmail(e.target.value.trim())}
            />
            <input
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
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
              <Image src={"/google.png"} alt={"google image for login"} width={55} height={40} />
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
              <Image src={"/google.png"} alt={"google image for login"} width={55} height={40} />
              <p>Accede con Google</p>
            </div>
          </form>
        </div>
      )}
      <div className={styles.toggleButton}>
        <div onClick={() => setToggleView(!toggleView)}>
          {toggleView ? "¿Estás registrado?, accede" : "¿No tienes cuenta?, creala"}
        </div>
      </div>
    </div>
  );
};

export default Acceso