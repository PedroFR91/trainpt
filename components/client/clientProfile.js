import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/program.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../../firebase.config';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FaEdit, FaRegEdit } from 'react-icons/fa';
import Link from 'next/link';
const clientProfile = () => {
  const { myData, myUid } = useContext(AuthContext);
  const auth = getAuth();
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  useEffect(() => {
    file && handleImageUpload();
  }, [file]);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);
  const handleImageUpload = async () => {
    if (!file) return;

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await updateDoc(doc(db, 'users', myUid), { img: downloadURL });
        });
      }
    );
  };
  useEffect(() => {
    if (myUid) {
      const subsQuery = query(collection(db, 'subscriptions'), where("clientId", "==", myUid));
      getDocs(subsQuery).then(querySnapshot => {
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;
          setSubscription({ ...docData, id: docId });

          // Obtener el formulario inicial si existe
          if (docData.initialForm) {
            const formRef = doc(db, 'forms', docData.initialForm);
            getDoc(formRef).then(formSnap => {
              if (formSnap.exists()) {
                setInitialFormDetails(formSnap.data());
              } else {
                console.error("No se encontró el formulario inicial:", docData.initialForm);
              }
            }).catch(error => {
              console.error("Error al obtener el formulario inicial:", error);
            });
          }
        } else {
          console.error("No se encontró la suscripción para el cliente:", myUid);
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error al obtener la suscripción:", error);
        setLoading(false);
      });
    }
  }, [myUid]);

  return (
    <>
      {myData && (
        <div className={styles.myprofile}>
          <img
            src={myData.img ? myData.img : '/face.jpg'}
            alt={'img'}
            className={styles.myprofileimg}
            htmlFor='file'
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('file').click();
            }}
          />
          <input
            type='file'
            id='file'
            onChange={(e) => setFile(e.target.files[0])}
            hidden
          />
          <Link href={`/shared/subcription/${myUid}`} className={styles.myLink}>
            {(subscription?.status)?.toUpperCase()}
          </Link>

        </div>
      )}
    </>
  );
};

export default clientProfile;
