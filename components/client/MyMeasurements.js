// components/client/MyMeasurements.js
import React, { useEffect, useState } from 'react';
import { Card, Empty } from 'antd';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import styles from '../../styles/Measures.module.css';

const MyMeasurements = ({ myUid }) => {
    const [options, setOptions] = useState({
        chart: { type: 'line' },
        title: { text: 'Evolución de Medidas' },
        xAxis: {
            categories: [],
            title: { text: 'Fecha' },
        },
        yAxis: {
            title: { text: 'Medidas (cm)' },
        },
        series: [],
    });

    useEffect(() => {
        // Datos mockeados para pruebas
        const mockData = [
            { date: '2024-10-01', measures: { pecho: 95, cintura: 80, cadera: 100 } },
            { date: '2024-11-01', measures: { pecho: 97, cintura: 78, cadera: 98 } },
            { date: '2024-12-01', measures: { pecho: 98, cintura: 76, cadera: 97 } },
        ];

        // Extracción de categorías (fechas) y datos de series (medidas)
        const categories = mockData.map((entry) => entry.date);
        const seriesData = {};

        mockData.forEach((entry) => {
            Object.entries(entry.measures).forEach(([measure, value]) => {
                if (!seriesData[measure]) {
                    seriesData[measure] = { name: measure, data: [] };
                }
                seriesData[measure].data.push(value);
            });
        });

        setOptions((prevOptions) => ({
            ...prevOptions,
            xAxis: { ...prevOptions.xAxis, categories },
            series: Object.values(seriesData),
        }));
    }, [myUid]);

    return (
        <Card className={styles.measuresCard} title="Mis Medidas">
            {options.series.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={options} />
            ) : (
                <Empty description="No hay datos de medidas disponibles" />
            )}
        </Card>
    );
};

export default MyMeasurements;
