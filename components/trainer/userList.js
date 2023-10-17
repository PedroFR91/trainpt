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
const userList = () => {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState("");
  const { myData, myUid } = useContext(AuthContext);
  const [routine, setRoutine] = useState([]);
  const [myForm, setMyForm] = useState([]);
  const [clients, setClients] = useState([]);

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
    if (myData) {
      console.log("Use effect de clients fuera");
      console.log(myData.link);
      if (myData.link && myData.link.length > 0) {
        // Realizar la consulta para obtener los clientes vinculados al entrenador actual
        const q = query(
          collection(db, "users"),
          where("id", "in", myData.link)
        );
        const unsub = onSnapshot(q, (snapShot) => {
          let list = [];
          snapShot.docs.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          // Actualizar el estado con los clientes vinculados
          setClients(list);
          console.log(list);
        });

        return () => {
          unsub();
        };
      }
    }
  }, [myData]);

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

                {myData.status &&
                  myData.status.find((status) => status.id === data.id) && (
                    <>
                      <p>Estatus:</p>
                      <p
                        className={`${styles.status} ${myData.status.find((status) => status.id === data.id)
                          .name === "pendiente"
                          ? styles.yellowStatus
                          : myData.status.find(
                            (status) => status.id === data.id
                          ).name === "inicial"
                            ? styles.blueStatus
                            : myData.status.find(
                              (status) => status.id === data.id
                            ).name === "archivos"
                              ? styles.greenStatus
                              : ""
                          }`}
                      ><span></span>
                        {
                          myData.status.find((status) => status.id === data.id)
                            .name
                        }
                      </p>
                    </>

                  )}
                <Link href={`/shared/clients/${data.id}`} >
                  <span className={styles.spanbutton} >Ver Info</span>
                </Link>
              </div>
            </div>
          ))}

      </div>

    </div >
  );
};

export default userList;
