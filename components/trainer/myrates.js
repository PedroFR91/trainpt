// components/trainer/MyRates.js
import React, { useState, useEffect, useContext } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AuthContext from '../../context/AuthContext';
import RatesCard from './RatesCard';
import {
  addSubcollectionDocument,
  deleteSubcollectionDocument,
  listenToSubcollection,
} from '../../services/firebase';

const MyRates = () => {
  const { myUid } = useContext(AuthContext);
  const [rates, setRates] = useState([]);

  useEffect(() => {
    if (!myUid) return;

    const unsub = listenToSubcollection(
      'trainers',
      myUid,
      'rates',
      [],
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRates(list);
      },
      (error) => console.error('Error fetching rates: ', error)
    );
    return () => unsub();
  }, [myUid]);

  const handleShare = (rate) => {
    navigator.clipboard.writeText(`Tarifa: ${rate.ratename}\nPrecio: ${rate.rateprice} €/${rate.ratefrequency}`);
    message.success('Tarifa copiada al portapapeles');
  };

  return (
    <div>
      <RatesCard rates={rates} onShare={handleShare} />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => console.log('Añadir Tarifa')}>
        Añadir Tarifa
      </Button>
    </div>
  );
};

export default MyRates;
