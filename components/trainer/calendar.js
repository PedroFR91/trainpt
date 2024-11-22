// components/trainer/calendar.js

import React, { useContext, useEffect, useState } from 'react';
import { Badge, Calendar } from 'antd';
import moment from 'moment';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/trainerhome.module.css';
import {
  listenToSubcollection,
} from '../../services/firebase';

const CustomCalendar = () => {
  moment.locale('es');
  const { myUid } = useContext(AuthContext);
  const [firebaseDates, setFirebaseDates] = useState([]);

  useEffect(() => {
    if (!myUid) return;

    const unsub = listenToSubcollection(
      'trainers',
      myUid,
      'forms',
      [],
      (snapShot) => {
        const dates = snapShot.docs.map((doc) => {
          const data = doc.data();
          if (data.timeStamp && data.timeStamp.toDate) {
            return moment(data.timeStamp.toDate()).format('D/M/YYYY');
          } else {
            return null;
          }
        }).filter(date => date !== null);
        setFirebaseDates(dates);
      },
      (error) => console.error(error)
    );
    return () => unsub();
  }, [myUid]);

  const getListData = (value) => {
    const formattedDate = value.format('D/M/YYYY');
    return firebaseDates.includes(formattedDate)
      ? [{ type: 'success', content: 'Evento' }]
      : [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  return <Calendar className={styles.container} dateCellRender={dateCellRender} />;
};

export default CustomCalendar;
