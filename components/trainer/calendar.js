import React, { useContext, useEffect, useState } from 'react';
import { Badge, Calendar } from 'antd';
import moment from 'moment';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import AuthContext from '../../context/AuthContext';
import styles from '../../styles/trainerhome.module.css';

const CustomCalendar = () => {
  moment.locale('es');
  const { myUid } = useContext(AuthContext);
  const [firebaseDates, setFirebaseDates] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'forms'),
      (snapShot) => {
        const dates = snapShot.docs.map((doc) => moment(doc.data().timeStamp.seconds * 1000).format('D/M/YYYY'));
        setFirebaseDates(dates);
      },
      (error) => console.error(error)
    );
    return () => unsub();
  }, []);

  const getListData = (value) => {
    const formattedDate = value.format('D/M/YYYY');
    return firebaseDates.includes(formattedDate)
      ? [{ type: 'success', content: 'Event' }]
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
