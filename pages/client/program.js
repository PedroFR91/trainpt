import React, { useContext, useEffect, useState } from 'react';
import styles from '../../styles/program.module.css';
import ClientHeader from '../../components/client/clientHeader';
import ClientProfile from '../../components/client/clientProfile';
import TrainersList from '../../components/client/trainersList';
import AuthContext from '../../context/AuthContext';
import { follow } from '../../forms/initialForm';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase.config';
import MyImages from '../../components/client/myImages';
const program = () => {
  const revision = '10 Enero';
  const { myData, myUid } = useContext(AuthContext);
  const [formDataFollow, setFormDataFollow] = useState(follow);
  const [myForm, setMyForm] = useState([]);
  const [expand, setExpand] = useState(true);

  const handleSubmitFollow = (event) => {
    event.preventDefault();
    console.log(formDataFollow);
    handleCreateFollow();
  };
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
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
  const handleCreateFollow = async (e) => {
    try {
      await addDoc(collection(db, 'forms'), {
        ...formDataFollow,
        link: myUid,
        type: 'Semanal',
        timeStamp: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  const handleMeasuresChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      measures: {
        ...formDataFollow.measures,
        [event.target.name]: event.target.value,
      },
    });
  };
  const handlePhotosChangeFollow = (event) => {
    setFormDataFollow({
      ...formDataFollow,
      photos: {
        ...formDataFollow.photos,
        [event.target.name]: event.target.files[0],
      },
    });
  };

  return (
    <div className={styles.programContainer}>
      <ClientHeader />
      <div className={styles.programlayout}>
        <div className={styles.horizontal}>
          <ClientProfile />

          <div className={styles.datacontainer}>
            <div>Actualice sus datos semanales</div>
            <div onClick={() => setExpand(false)} className={styles.button}>
              +
            </div>
            {!expand && (
              <div className={styles.weekData}>
                <form
                  onSubmit={handleSubmitFollow}
                  className={styles.weekfollow}
                >
                  <div className={styles.weekfollowLeft}>
                    <div>
                      <h3>Medidas</h3>
                      <label>
                        Chest:
                        <input
                          type='text'
                          name='chest'
                          value={formDataFollow.measures.chest}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Hombros:
                        <input
                          type='text'
                          name='shoulders'
                          value={formDataFollow.measures.shoulders}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Biceps:
                        <input
                          type='text'
                          name='biceps'
                          value={formDataFollow.measures.biceps}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Cintura:
                        <input
                          type='text'
                          name='hips'
                          value={formDataFollow.measures.hips}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Abdomen:
                        <input
                          type='text'
                          name='abdomen'
                          value={formDataFollow.measures.abdomen}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Cuadriceps:
                        <input
                          type='text'
                          name='cuadriceps'
                          value={formDataFollow.measures.cuadriceps}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Gemelos:
                        <input
                          type='text'
                          name='gemelos'
                          value={formDataFollow.measures.gemelos}
                          onChange={handleMeasuresChangeFollow}
                        />
                      </label>
                      <br />
                    </div>
                  </div>
                  <div className={styles.weekfollowRight}>
                    <div>
                      {/*<h3>Fotos</h3>
                      <label>
                        Frontal:
                        <input
                          type='file'
                          name='front'
                          onChange={handlePhotosChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Espalda:
                        <input
                          type='file'
                          name='back'
                          onChange={handlePhotosChangeFollow}
                        />
                      </label>
                      <br />
                      <label>
                        Lateral:
                        <input
                          type='file'
                          name='lateral'
                          onChange={handlePhotosChangeFollow}
                        />
                      </label>
                      <br /> */}
                      <button type='submit'>Submit</button>
                    </div>
                  </div>
                  <div
                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                    className={styles.button}
                    onClick={() => setExpand(true)}
                  >
                    X
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        <MyImages />
        <div className={styles.nextrevision}>Próxima revisión:{revision}</div>

        <>
          <TrainersList />
        </>
      </div>
    </div>
  );
};

export default program;
