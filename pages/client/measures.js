import React from 'react';
import ClientHeader from '../../components/client/clientHeader';
import styles from '../../styles/Measures.module.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' ,
    },
    title: {
      display: true,
      text: 'Mis medidas',
    },
  },
};

const labels = ['Abdomen', 'Cintura', 'Pecho', 'Hombros', 'Cadera', 'Gemelos', 'Cuadriceps'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Semana 1',
      data: [1,2,3,4,5,6,7],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Semana 2',
      data: [3,3,3,3,3,3,3],
      borderColor: 'rgb(255, 0, 0)',
      backgroundColor: 'rgba(255, 0,0, 0.5)',
    },
  
  ],
};

const measures = () => {
  
  return (
    <div>
      <ClientHeader />
      <div className={styles.mygraph}>
        <Line options={options} data={data} />
      </div>

     
    </div>
  );
};

export default measures;
