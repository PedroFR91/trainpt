import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/rate.module.css";
import AuthContext from "../../context/AuthContext";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase.config";
import Modal from "./Modal";
import dynamic from "next/dynamic";
import {
  AiFillCloseCircle,
  AiFillDelete,
  AiFillEdit,
  AiFillSave,
  AiOutlineDelete,
} from "react-icons/ai";
// Importa el componente RichTextEditor de forma dinámica
const RichTextEditor = dynamic(() => import("./RichTextEditor"), {
  ssr: false,
});
const myrates = () => {
  const { myUid } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [rates, setRates] = useState([]);
  const [view, setView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState("");
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rates"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setRates(list);
      },
      (error) => {
        console.log(error);
      }
    );

    setClientSide(true);

    return () => {
      unsub();
    };
  }, []);

  const handleSave = async (e) => {
    const time = new Date().getTime();
    try {
      await setDoc(doc(db, "rates", data.ratename), {
        ...data,
        rateid: myUid,
        rateinfo: text,
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }

    setData([]);
    setText("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "rates", id));
      setRates(rates.filter((item) => item.ratename !== id));
      console.log(rateid);
    } catch (error) {}
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setText("");
  };
  return (
    <div className={styles.container}>
      <div className={styles.addrate}>
        <h2>Añade tus tarifas</h2>
        {!view ? (
          <button className={styles.add} onClick={() => setView(true)}>
            <AiFillEdit size={30} />
          </button>
        ) : (
          <button className={styles.add} onClick={() => setView(false)}>
            <AiFillCloseCircle size={30} />
          </button>
        )}
        {view && (
          <div>
            <input
              type="text"
              placeholder="Nombre de Tarifa"
              onChange={(e) => setData({ ...data, ratename: e.target.value })}
            />
            <input
              type="text"
              placeholder="Precio"
              onChange={(e) => setData({ ...data, rateprice: e.target.value })}
            />

            <div
              className={styles.displayText}
              dangerouslySetInnerHTML={{ __html: text }}
            ></div>
            <div onClick={openModal} className={styles.moreinfo}>
              Información
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <div className={styles.modal}>
          <h3>Detalles de la oferta</h3>
          {clientSide && <RichTextEditor value={text} onChange={setText} />}
          <button
            className={styles.save}
            onClick={() => {
              handleSave();
              closeModal();
              setView(false);
            }}
          >
            <AiFillSave />
          </button>
        </div>
      </Modal>
      <div className={styles.rates}>
        {rates
          .filter((data) => data.rateid === myUid)
          .map((rate) => (
            <div key={rate.ratename} className={styles.rate}>
              <h1>{rate.ratename}</h1>
              <h2>{rate.rateprice}</h2>
              <div
                className={styles.displayTextTwo}
                dangerouslySetInnerHTML={{ __html: rate.rateinfo }}
              ></div>
              <div className={styles.mybuttons}>
                <button
                  onClick={() => handleDelete(rate.ratename)}
                  className={styles.add}
                >
                  <AiFillDelete />
                </button>
                <button
                  onClick={() => handleDelete(rate.ratename)}
                  className={styles.add}
                >
                  <AiFillEdit />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default myrates;
