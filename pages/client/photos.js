import React, { useContext, useEffect, useState } from 'react';
import ClientHeader from '../../components/client/clientHeader';
import AuthContext from '../../context/AuthContext';
import MyPhotos from '../../components/client/MyPhotos';

const Photos = () => {
  const { myUid } = useContext(AuthContext);

  return (
    <div>
      <ClientHeader />
      <MyPhotos myUid={myUid} />
    </div>
  );
};

export default Photos;
