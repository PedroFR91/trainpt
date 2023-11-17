import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/userList.module.css";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase.config";
import AuthContext from "../../context/AuthContext";
import Link from "next/link";
import {
  FaCamera,
  FaChartLine,
  FaFile,
  FaMale,
  FaProcedures,
  FaRunning,
  FaSignOutAlt,
} from 'react-icons/fa';
import { MdFoodBank } from 'react-icons/md'
import { useRouter } from "next/router";
const userList = () => {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState("");
  const { myData, myUid } = useContext(AuthContext);
  const [routine, setRoutine] = useState([]);
  const [myForm, setMyForm] = useState([]);
  const [clients, setClients] = useState([]);
  const router = useRouter();

  const showClient = (data) => {
    if (myData.link && myData.link.includes(data.id)) {
      setShow(true);
      setCurrent(data);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "routines"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRoutine(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "forms"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setMyForm(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    // Consultar la colección 'subscriptions' para obtener los clientes del entrenador
    const q = query(collection(db, "subscriptions"), where("trainerId", "==", myUid));
    const unsub = onSnapshot(q, (querySnapshot) => {
      const clientIds = querySnapshot.docs.map((doc) => doc.data().clientId);

      if (clientIds.length > 0) {
        // Consultar la colección 'users' para obtener los datos de los clientes
        const clientsQuery = query(collection(db, "users"), where("id", "in", clientIds));
        onSnapshot(clientsQuery, (clientsSnapshot) => {
          const clientsData = clientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setClients(clientsData); // Actualizar el estado con los datos de los clientes
        });
      }
    });

    return () => unsub();
  }, [myUid]);

  const handleSubscriptionLinkClick = (userId) => {
    // Guarda el rol del usuario en el almacenamiento local antes de navegar
    localStorage.setItem('userRole', myData?.role);
    // Navega a la página de suscripción
    router.push(`/shared/subcription/${userId}`);
  };

  return (
    <div className={styles.container}>
      <h1>Mis Clientes</h1>
      <div className={styles.list}>
        {!show &&
          clients &&
          clients.map((data) => (
            <div>
              <div key={data.id} className={styles.userdata}>
                <div>
                  {data.img ? (
                    <>
                      <img src={data.img} alt={"myprofileimg"} />
                      <div>{data.username}</div></>
                  ) : (
                    <>
                      <img src="/face.jpg" alt={"myprofileimg"} />
                      <div>{data.username}</div>
                    </>
                  )}
                </div>


                <Link href={`/shared/clients/${data.id}`} >
                  <span className={styles.spanbutton} >Ver Info</span>
                </Link>
                <span
                  className={styles.spanbutton}
                  onClick={() => handleSubscriptionLinkClick(data.id)}
                >
                  Ver Suscripción
                </span>
              </div>
            </div>
          ))}

      </div>

    </div >
  );
};

export default userList;
