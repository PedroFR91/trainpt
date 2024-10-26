// components/client/MyForms.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Empty } from 'antd';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';
import Link from 'next/link';
import styles from '../../styles/Forms.module.css';

const MyForms = ({ myUid }) => {
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    // Datos mockeados para pruebas
    const mockData = [
      { id: '1', type: 'Formulario de Registro', date: '2024-10-01', status: 'Pendiente' },
      { id: '2', type: 'Cuestionario de Salud', date: '2024-11-01', status: 'Completado' },
      { id: '3', type: 'Encuesta de Satisfacción', date: '2024-12-01', status: 'Pendiente' },
    ];

    setFormList(mockData);
  }, [myUid]);

  const columns = [
    {
      title: 'Tipo de Formulario',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Fecha de Envío',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completado' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Opciones',
      key: 'action',
      render: (_, record) => (
        <Link href={`/shared/forms/${record.id}?clientId=${myUid}`}>
          <Button type="link">
            {record.status === 'Pendiente' ? 'Rellenar' : 'Revisar'}
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className={styles.formTable}>
      {formList.length > 0 ? (
        <Table columns={columns} dataSource={formList} rowKey="id" />
      ) : (
        <Empty description="No hay formularios disponibles" />
      )}
    </div>
  );
};

export default MyForms;
