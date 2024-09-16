import React, { useState, useEffect, useContext } from 'react';
import { Card, Avatar, Button, Upload, message } from 'antd';
import { UploadOutlined, EditOutlined } from '@ant-design/icons';
import { db, storage } from '../../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import AuthContext from '../../context/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import AddText from '../../components/trainer/addText';
import styles from '../../styles/myprofile.module.css';

const MyProfile = () => {
  const { myData, myUid } = useContext(AuthContext);
  const [file, setFile] = useState(null);

  useEffect(() => {
    file && handleImageUpload();
  }, [file]);

  const handleImageUpload = async () => {
    if (!file) return;

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  const uploadProps = {
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <div className={styles.myContainer}>
      {myData && (
        <Card


          actions={[
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Cambiar Imagen</Button>
            </Upload>,
            <Button icon={<EditOutlined />}>Editar</Button>
          ]}
        >
          <Card.Meta
            avatar={<Avatar src={myData.img ? myData.img : '/face.jpg'} />}
            title={myData.username}
            description={<div className={styles.myprofileinfo}><AddText /></div>}
          />
        </Card>
      )}
    </div>
  );
};

export default MyProfile;
