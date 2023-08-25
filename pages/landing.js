import React from 'react';
import styles from '../styles/landing.module.css';
const landing = () => {
  const sections = [
    { text: 'REIVENTA EL ENTRENAMIENTO PERSONAL ONLINE', src: '/logo.png' },
    { text: 'MANTEN EL CONTROL DE TODOS TUS CLIENTES', src: '/background.mp4' },
    { text: 'TU CALENDARIO DETALLADO', src: 'Foto' },
    { text: 'AUTOMATIZA TU SEGUIMIENTO', src: 'Foto' },
    { text: 'TU CARTA DE PRESENTACIÓN PROFESIONAL', src: 'Foto' },
    { text: 'COMPARTE TODO CON TUS CLEINTES', src: 'Foto' },
    { text: 'DISFRUTA DE NUESTRO CREADOR DE RUTINAS', src: 'Foto' },
  ];
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>Acceso</div>
        <div>Acceso</div>
        <div>Acceso</div>
      </div>
      {sections.map((section, index) => (
        <div key={section.id} className={styles.section}>
          {index === 0 ? (
            <>
              <div className={styles.logo}>
                <img src={section.src} width='100%' />
              </div>
              <div className={styles.text}>{section.text}</div>
            </>
          ) : index % 2 === 0 ? (
            <>
              <div className={styles.text}>{section.text}</div>
              <div>
                {' '}
                <video
                  src={section.src}
                  width='100%'
                  height='100%'
                  autoPlay
                  loop
                  muted
                />
              </div>
            </>
          ) : (
            <>
              <div>
                {' '}
                <video
                  src={section.src}
                  width='100%'
                  height='100%'
                  autoPlay
                  loop
                  muted
                />
              </div>
              <div className={styles.text}>{section.text}</div>
            </>
          )}
        </div>
      ))}

      <div className={styles.footer}>FOOTER</div>
    </div>
  );
};

export default landing;
