import React, { useEffect, useState } from 'react';
import styles from '../styles/formStyles.module.css';
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
    <div className={styles.formContainer}>
      <form onSubmit={handleAdd}>
        <div className={styles.divimage}>
          <div className={styles.myimage}>
            <img
              src={data.img ? data.img : '/face.png'}
              width='100%'
              alt={''}
            />
          </div>
          <input
            type='file'
            id='file'
            onChange={(e) => setFile(e.target.files[0])}
            hidden
          />
        </div>
        <button
          className={styles.label}
          htmlFor='file'
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('file').click();
          }}
        >
          Subir Foto
        </button>
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
          <div>
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setData({ ...data, role: e.target.value });
              }}
            >
              <option value='trainer'>Entrenador</option>
              <option value='client'>Cliente</option>
            </select>
          </div>
          <button type='submit'>Registro</button>
        </div>
      </form>
    </div>
  );
};

export default register;
