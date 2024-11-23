// components/trainer/MyProfile.js
import React, { useState, useContext, useEffect } from 'react';
import { message } from 'antd';
import AuthContext from '../../context/AuthContext';
import ProfileCard from './ProfileCard';
import { updateDocument, uploadFile, getDocument } from '../../services/firebase';

const MyProfile = () => {
  const { myData, myUid, setMyData } = useContext(AuthContext);
  const [likesCount, setLikesCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchTrainerData();
  }, [myData]);

  const fetchTrainerData = async () => {
    const trainerDoc = await getDocument('trainers', myUid);
    if (trainerDoc) {
      setLikesCount(trainerDoc.likes?.length || 0);
      const ratings = trainerDoc.ratings || [];
      setAverageRating(
        ratings.length > 0
          ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
          : 0
      );
      setComments(trainerDoc.comments || []);
    }
  };

  const handleUpload = async (file, field) => {
    const filePath = `${field}/${myUid}/${file.name}`;
    const downloadURL = await uploadFile(filePath, file);
    await updateDocument('trainers', myUid, { [field]: downloadURL });
    message.success(`${field === 'img' ? 'Foto' : 'Fondo'} actualizado`);
    setMyData((prev) => ({ ...prev, [field]: downloadURL }));
  };

  const beforeUploadProfile = (file) => {
    setProfileFile(file);
    return false; // Evita la subida automática
  };

  const handleProfileUpload = async () => {
    if (profileFile) {
      await handleImageUpload(profileFile, 'img');
      setProfileFile(null);
    }
  };

  const publicProfileUrl = `${window.location.origin}/trainer/${myUid}`;

  return (
    <ProfileCard
      profileData={myData}
      likesCount={likesCount}
      averageRating={averageRating}
      comments={comments}
      showEditButton
      showCopyButton
      editable
      onEdit={() => console.log('Editar Perfil')}
      onCopy={() => {
        navigator.clipboard.writeText(`${window.location.origin}/trainer/${myUid}`);
        message.success('URL copiada');
      }}
      onUploadProfilePicture={(file) => handleUpload(file, 'img')}
      onUploadBackground={(file) => handleUpload(file, 'background')}
    />
  );
};

export default MyProfile;
