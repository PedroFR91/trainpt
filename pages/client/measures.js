import React, { useContext, useEffect, useState } from "react";
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
import { db } from "../../firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import AuthContext from '../../context/AuthContext';

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
    label: "abdomen",
    data: [],
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.5)",
  },
  {
    label: "hips",
    data: [],
    borderColor: "rgb(255, 0, 0)",
    backgroundColor: "rgba(255, 0, 0, 0.5)",
  },
  {
    label: "chest",
    data: [],
    borderColor: "rgb(0, 128, 255)",
    backgroundColor: "rgba(0, 128, 255, 0.5)",
  },
  {
    label: "shoulders",
    data: [],
    borderColor: "rgb(0, 255, 0)",
    backgroundColor: "rgba(0, 255, 0, 0.5)",
  },
  {
    label: "biceps",
    data: [],
    borderColor: "rgb(255, 255, 0)",
    backgroundColor: "rgba(255, 255, 0, 0.5)",
  },
  {
    label: "gemelos",
    data: [],
    borderColor: "rgb(128, 0, 128)",
    backgroundColor: "rgba(128, 0, 128, 0.5)",
  },
  {
    label: "cuadriceps",
    data: [],
    borderColor: "rgb(0, 0, 128)",
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
  const { myUid } = useContext(AuthContext);
  const [measures, setMeasures] = useState({});
  const [labels, setLabels] = useState({});
  const [selectedMagnitudes, setSelectedMagnitudes] = useState([]);
  const colorPalette = [
    "rgb(0, 128, 255)",
    "rgb(255, 99, 132)",
    "rgb(0, 255, 0)",
    "rgb(255, 0, 0)",
    "rgb(255, 255, 0)",
    "rgb(128, 0, 128)",
    "rgb(0, 0, 128)",
    // Puedes agregar más colores según sea necesario
  ];
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const applyDateFilter = () => {
    // Realiza el filtrado por fechas aquí
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    const filteredMeasures = selectedMagnitudes.map((magnitude, index) => {
      const colorIndex = index % colorPalette.length;
      const filteredData = measures[magnitude] ? measures[magnitude].reduce((result, value, i) => {
        const timestamp = new Date(labels[i]);
        console.log("timestamp:", timestamp);
        if (
          (!startDate || timestamp >= parseDate(startDate)) &&
          (!endDate || timestamp <= parseDate(endDate))
        ) {
          result.push(value);
        }
        return result;
      }, []) : [];
      return {
        label: magnitude,
        data: filteredData,
        borderColor: colorPalette[colorIndex],
        backgroundColor: colorPalette[colorIndex],
      };
    });

    // Actualiza el estado con las medidas filtradas
    setSelectedMagnitudes(filteredMeasures);
  };

  // Función para parsear fechas en formato dd/mm/yyyy a Date
  function parseDate(dateString) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  }


  useEffect(() => {
    const q = query(collection(db, "forms"), where("clientId", "==", myUid));

    getDocs(q)
      .then((querySnapshot) => {
        const measuresData = {};
        const timeStamps = [];

        const sortedDocs = querySnapshot.docs.sort((a, b) =>
          a.data().timeStamp.toDate() - b.data().timeStamp.toDate()
        );

        sortedDocs.forEach((doc) => {
          const data = doc.data().measures;
          if (data) {
            for (const label in data) {
              if (!measuresData[label]) {
                measuresData[label] = [];
              }
              measuresData[label].push(Number(data[label]));
            }
            // Formatea el timeStamp como etiquetas legibles
            timeStamps.push(
              new Date(doc.data().timeStamp.toDate()).toLocaleDateString()
            );
          }
        });

        setMeasures(measuresData);
        setLabels(timeStamps);
        setSelectedMagnitudes(Object.keys(measuresData));
      })
      .catch((error) => {
        console.error("Error al obtener los documentos: ", error);
      });
  }, [myUid]);


  const handleMagnitudeChange = (magnitude) => {
    if (selectedMagnitudes.includes(magnitude)) {
      setSelectedMagnitudes(selectedMagnitudes.filter((item) => item !== magnitude));
    } else {
      setSelectedMagnitudes([...selectedMagnitudes, magnitude]);
    }
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
              labels: labels,
              datasets: selectedMagnitudes.map((magnitude, index) => {
                const colorIndex = index % colorPalette.length;
                const filteredData = measures[magnitude] ? measures[magnitude].reduce((result, value, i) => {
                  const timestamp = new Date(labels[i]);
                  if (
                    (!startDate || timestamp >= new Date(startDate)) &&
                    (!endDate || timestamp <= new Date(endDate))
                  ) {
                    result.push(value);
                  }
                  return result;
                }, []) : [];
                return {
                  label: magnitude,
                  data: filteredData,
                  borderColor: colorPalette[colorIndex],
                  backgroundColor: colorPalette[colorIndex],
                };
              }),
            }}
          />
        </div>

        <div>
          <input
            type="date"
            onChange={handleStartDateChange}
            value={startDate}
          />
          <input
            type="date"
            onChange={handleEndDateChange}
            value={endDate}
          />
          <button onClick={applyDateFilter}>Aplicar Filtro</button>
        </div>
      </div>
    </div>
  );
};

export default Measures;
