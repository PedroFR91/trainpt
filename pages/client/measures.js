import React, { useState } from "react";
import ClientHeader from "../../components/client/clientHeader";
import styles from "../../styles/Measures.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const initialData = [
  {
    label: "Abdomen",
    data: [1, 2, 3, 4, 5, 6, 7],
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.5)",
  },
  {
    label: "Cintura",
    data: [3, 3, 3, 3, 3, 3, 3],
    borderColor: "rgb(255, 0, 0)",
    backgroundColor: "rgba(255, 0, 0, 0.5)",
  },
  {
    label: "Pecho",
    data: [2, 4, 6, 8, 10, 12, 14], // Agrega los datos para el pecho aquí
    borderColor: "rgb(0, 128, 255)", // Puedes personalizar el color
    backgroundColor: "rgba(0, 128, 255, 0.5)",
  },
  {
    label: "Hombros",
    data: [4, 5, 6, 7, 8, 9, 10], // Agrega los datos para los hombros aquí
    borderColor: "rgb(0, 255, 0)", // Puedes personalizar el color
    backgroundColor: "rgba(0, 255, 0, 0.5)",
  },
  {
    label: "Cadera",
    data: [5, 5, 5, 5, 5, 5, 5], // Agrega los datos para la cadera aquí
    borderColor: "rgb(255, 255, 0)", // Puedes personalizar el color
    backgroundColor: "rgba(255, 255, 0, 0.5)",
  },
  {
    label: "Gemelos",
    data: [2, 3, 4, 3, 2, 3, 4], // Agrega los datos para los gemelos aquí
    borderColor: "rgb(128, 0, 128)", // Puedes personalizar el color
    backgroundColor: "rgba(128, 0, 128, 0.5)",
  },
  {
    label: "Cuadriceps",
    data: [6, 7, 8, 7, 6, 7, 8], // Agrega los datos para los cuádriceps aquí
    borderColor: "rgb(0, 0, 128)", // Puedes personalizar el color
    backgroundColor: "rgba(0, 0, 128, 0.5)",
  },
  // Agrega datos similares para otras magnitudes aquí
];

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Mis medidas",
    },
  },
};

const Measures = () => {
  const [selectedMagnitude, setSelectedMagnitude] = useState("Abdomen");

  const handleMagnitudeChange = (magnitude) => {
    setSelectedMagnitude(magnitude);
  };

  return (
    <div>
      <ClientHeader />
      <div className={styles.mycontainer}>
        <h1>Mis medidas</h1>

        <div className={styles.mygraph}>
          <Line
            options={options}
            data={{
              labels: [
                "Semana 1",
                "Semana 2",
                "Semana 3",
                "Semana 4",
                "Semana 5",
                "Semana 6",
                "Semana 7",
              ],
              datasets: [
                initialData.find((item) => item.label === selectedMagnitude),
              ],
            }}
          />
        </div>
        <div>
          <p>Seleccionar Magnitud:</p>
          <select onChange={(e) => handleMagnitudeChange(e.target.value)}>
            {initialData.map((item) => (
              <option key={item.label} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Measures;
