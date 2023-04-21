import React, {
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import styles from '../../styles/previousimg.module.css';
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import { db, storage } from '../../firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AuthContext from '../../context/AuthContext';
import { HiOutlineFolderAdd, HiOutlineUpload } from 'react-icons/hi';

const previousClientsImg = () => {
  const { myUid } = useContext(AuthContext);
  const [fileBefore, setFileBefore] = useState(null);
  const [fileAfter, setFileAfter] = useState(null);
  const [clientName, setClientName] = useState('');
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState([]);
  const [tempFileBefore, setTempFileBefore] = useState(null);
  const [tempFileAfter, setTempFileAfter] = useState(null);
  const [bothUploaded, setBothUploaded] = useState(false);

  useEffect(() => {
    const uploadFile = async (fileToUpload, period) => {
      const name = new Date().getTime() + fileToUpload.name;
      const storageRef = ref(storage, name);
      const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
            default:
              break;
          }
        },
        (error) => {
          // Handle unsuccessful uploads
          console.log(error);
        },
        async () => {
          // Handle successful upload on complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log(downloadURL);

          // Save the downloadURL to Firestore
          const photoData = {
            trainerId: myUid,
            clientName: clientName,
            period: period,
            img: downloadURL,
            title: fileToUpload.name,
            createdAt: serverTimestamp(),
          };
          try {
            await setDoc(doc(collection(db, 'clientPhotos')), photoData);
          } catch (error) {
            console.log(error);
          }
        }
      );
    };

    if (fileBefore) {
      uploadFile(fileBefore, 'before');
      setFileBefore(null);
    }

    if (fileAfter) {
      uploadFile(fileAfter, 'after');
      setFileAfter(null);
    }
    if (!fileBefore && !fileAfter && tempFileBefore && tempFileAfter) {
      setBothUploaded(true);
    }
  }, [fileBefore, fileAfter, myUid, clientName]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'clientPhotos'),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setPhotos(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  const handleDeleteGroup = async (client) => {
    const photosToDelete = photos.filter(
      (photo) => photo.trainerId === myUid && photo.clientName === client
    );

    await Promise.all(
      photosToDelete.map(async (photo) => {
        try {
          await deleteDoc(doc(db, 'clientPhotos', photo.id));
        } catch (error) {}
      })
    );
  };

  const Step1 = ({ clientName, setClientName, setStep }) => (
    <>
      <input
        type='text'
        placeholder='Nombre del cliente'
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        required
      />
      <button onClick={() => setStep(2)}>Siguiente</button>
    </>
  );

  const Step2 = ({ setTempFileBefore, setStep }) => (
    <>
      <input
        type='file'
        id='fileBefore'
        onChange={(e) => {
          setTempFileBefore(e.target.files[0]);
        }}
        hidden
        required
      />
      <label htmlFor='fileBefore'>Seleccionar foto antes</label>
      <button onClick={() => setStep(3)}>Siguiente</button>
    </>
  );

  const Step3 = ({
    setFileBefore,
    setFileAfter,
    setStep,
    tempFileBefore,
    tempFileAfter,
  }) => (
    <>
      <input
        type='file'
        id='fileAfter'
        onChange={(e) => {
          setTempFileAfter(e.target.files[0]);
        }}
        hidden
        required
      />
      {!bothUploaded && (
        <label htmlFor='fileAfter'>Seleccionar foto después</label>
      )}
      <button
        onClick={() => {
          setFileBefore(tempFileBefore);
          setFileAfter(tempFileAfter);
          setStep(1);
        }}
      >
        Subir imágenes
      </button>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <input
              type='text'
              placeholder='Nombre del cliente'
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
            />
            <button onClick={() => setStep(2)}>Siguiente</button>
          </>
        );
      case 2:
        return (
          <>
            <input
              type='file'
              id='fileBefore'
              onChange={(e) => {
                setTempFileBefore(e.target.files[0]);
                setStep(3);
              }}
              hidden
              required
            />
            <label htmlFor='fileBefore'>Seleccionar foto antes</label>
            <button onClick={() => setStep(3)}>Siguiente</button>
          </>
        );
      case 3:
        return (
          <>
            <input
              type='file'
              id='fileAfter'
              onChange={(e) => {
                setTempFileAfter(e.target.files[0]);
              }}
              hidden
              required
            />
            <label htmlFor='fileAfter'>Seleccionar foto después</label>
            <button
              onClick={() => {
                setFileBefore(tempFileBefore);
                setFileAfter(tempFileAfter);
                setStep(1);
              }}
            >
              Subir imágenes
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.divimage}>{renderStep()}</div>
      <div className={styles.clientPhotos}>
        {/* Agrupar las imágenes por cliente */}
        {Array.from(new Set(photos.map((photo) => photo.clientName))).map(
          (client) => (
            <div key={client}>
              <h3>{client}</h3>
              <div className={styles.clientImgGroup}>
                {photos
                  .filter(
                    (data) =>
                      data.trainerId === myUid &&
                      data.clientName === client &&
                      data.period === 'before'
                  )
                  .map((photo) => (
                    <div key={photo.id} className={styles.clientImg}>
                      <img src={photo.img} alt={photo.title} />
                      <p>Antes</p>
                    </div>
                  ))}
                {photos
                  .filter(
                    (data) =>
                      data.trainerId === myUid &&
                      data.clientName === client &&
                      data.period === 'after'
                  )
                  .map((photo) => (
                    <div key={photo.id} className={styles.clientImg}>
                      <img src={photo.img} alt={photo.title} />
                      <p>Después</p>
                    </div>
                  ))}
              </div>
              <button onClick={() => handleDeleteGroup(client)}>
                Borrar grupo de imágenes
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default previousClientsImg;
