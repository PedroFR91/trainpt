import React, { useEffect, useState } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
import styles from '../../styles/Measures.module.css'
const MyMeasurements = ({ myUid }) => {
    const [options, setOptions] = useState({
        chart: {
            type: 'line'
        },
        title: {
            text: 'Evolución de Medidas'
        },
        xAxis: {
            categories: [],
            title: {
                text: 'Fecha'
            }
        },
        yAxis: {
            title: {
                text: 'Medidas (cm)'
            }
        },
        series: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const q = query(collection(db, "forms"), where("clientId", "==", myUid));
            const querySnapshot = await getDocs(q);
            const categories = []; // Fechas
            const series = {}; // Datos de las series

            querySnapshot.forEach(doc => {
                const { measures, timeStamp } = doc.data();
                const date = timeStamp.toDate().toLocaleDateString();
                categories.push(date);

                Object.entries(measures).forEach(([measureName, value]) => {
                    if (!series[measureName]) {
                        series[measureName] = { name: measureName, data: [] };
                    }
                    series[measureName].data.push(parseFloat(value));
                });
            });

            setOptions({
                ...options,
                xAxis: { ...options.xAxis, categories },
                series: Object.values(series)
            });
        };

        fetchData();
    }, [myUid]);

    return (
        <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={options} className={styles.myGraph} />
        </div >
    );
};

export default MyMeasurements;
