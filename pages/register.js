import React, { useEffect, useState } from 'react';
import styles from '../styles/register.module.css';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { async } from '@firebase/util';
import { auth, db, storage } from '../firebase.config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { userInputs } from '../forms/registerFormSource';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/router';

const register = () => {
  const [file, setFile] = useState('');
  const [data, setData] = useState({});
  const [per, setPer] = useState(null);
  const [selected, setSelected] = useState('trainer');
  const { push } = useRouter();

  useEffect(() => {
    setData({ ...data, role: 'trainer' });
  }, []);
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          setPer(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Uoload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          //Handle unsuccessful uplods
          console.log(error);
        },
        () => {
          //Handle succesful upload on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await setDoc(doc(db, 'users', res.user.uid), {
        ...data,
        id: res.user.uid,
        timeStamp: serverTimestamp(),
      });
      if (selected === 'trainer') {
        push('/trainer/home');
      } else {
        push('/client/program');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({ ...data, [id]: value });
  };

  return (
    <div className={styles.register}>
      <form onSubmit={handleAdd}>
        <div className={styles.divimage}>
          <div className={styles.myimage}>
            <img src={data.img ? data.img : '/face.png'} alt={''} />
          </div>
          <input
            type='file'
            id='file'
            onChange={(e) => setFile(e.target.files[0])}
            hidden
            required
          />
          <label className={styles.label} htmlFor='file'>
            Sube tu Imagen
          </label>
        </div>
        <div>
          {userInputs.map((input) => (
            <div key={input.id}>
              <input
                id={input.id}
                type={input.type}
                placeholder={input.placeholder}
                onChange={handleInput}
                required
              />
            </div>
          ))}
        </div>

        <div className={styles.selectRole}>
          <div className={styles.roles}>
            <p
              className={
                selected === 'trainer' ? styles.selected : styles.nonselected
              }
              onClick={() => {
                setSelected('trainer');
                setData({ ...data, role: 'trainer' });
              }}
            >
              Entrenador
            </p>
            <p
              className={
                selected === 'client' ? styles.selected : styles.nonselected
              }
              onClick={() => {
                setSelected('client');
                setData({ ...data, role: 'client' });
              }}
            >
              Cliente
            </p>
          </div>
          <button disabled={per !== null && per < 100} type='submit'>
            Registro
          </button>
        </div>
      </form>
    </div>
  );
};

export default register;
