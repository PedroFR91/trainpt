import React from 'react';
import styles from '../../styles/rate.module.css';
const myrates = () => {
  const rates = [
    { id: 1, name: 'Tarifa 1', price: 'Precio 1' },
    { id: 2, name: 'Tarifa 2', price: 'Precio 2' },
  ];
  return (
    <div className={styles.container}>
      {rates.map((rate) => (
        <div key={rate.id} className={styles.rate}>
          <p>{rate.name}</p>
          <p>{rate.price}</p>
        </div>
      ))}
      <p>Agregar Tarifa</p>
    </div>
  );
};

export default myrates;
