import React, { useEffect, useState } from "react";
import ClientHeader from "../../components/client/clientHeader";
import styles from "../../styles/Measures.module.css";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { db } from "../../firebase.config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { DatePicker, Checkbox, Button, Card, Row, Col, Space, Typography } from 'antd';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Title: AntTitle } = Typography;
const { RangePicker } = DatePicker;

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

const Measures = ({ clientId }) => {
    const [measures, setMeasures] = useState({});
    const [labels, setLabels] = useState([]);
    const [selectedMagnitudes, setSelectedMagnitudes] = useState([]);
    const colorPalette = [
        "rgb(0, 128, 255)",
        "rgb(255, 99, 132)",
        "rgb(0, 255, 0)",
        "rgb(255, 0, 0)",
        "rgb(255, 255, 0)",
        "rgb(128, 0, 128)",
        "rgb(0, 0, 128)",
    ];
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const applyDateFilter = () => {
        const filteredMeasures = selectedMagnitudes.map((magnitude, index) => {
            const colorIndex = index % colorPalette.length;
            const filteredData = measures[magnitude] ? measures[magnitude].reduce((result, value, i) => {
                const timestamp = new Date(labels[i]);
                if (
                    (!startDate || timestamp >= startDate) &&
                    (!endDate || timestamp <= endDate)
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

        setSelectedMagnitudes(filteredMeasures);
    };

    useEffect(() => {
        const q = query(collection(db, "forms"), where("clientId", "==", clientId));
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
                        timeStamps.push(
                            format(new Date(doc.data().timeStamp.toDate()), 'dd/MM/yyyy')
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
    }, [clientId]);

    const handleMagnitudeChange = (magnitude) => {
        if (selectedMagnitudes.includes(magnitude)) {
            setSelectedMagnitudes(selectedMagnitudes.filter((item) => item !== magnitude));
        } else {
            setSelectedMagnitudes([...selectedMagnitudes, magnitude]);
        }
    };

    return (
        <div className={styles.mycontainer}>
            <AntTitle level={2}>Mis medidas</AntTitle>
            <Row gutter={16} className={styles.mygraph}>
                <Col span={24}>
                    <Card>
                        <Line
                            options={options}
                            data={{
                                labels: labels,
                                datasets: selectedMagnitudes.map((magnitude, index) => {
                                    const colorIndex = index % colorPalette.length;
                                    const filteredData = measures[magnitude] ? measures[magnitude].reduce((result, value, i) => {
                                        const timestamp = new Date(labels[i]);
                                        if (
                                            (!startDate || timestamp >= startDate) &&
                                            (!endDate || timestamp <= endDate)
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
                    </Card>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                    <RangePicker onChange={handleDateChange} />
                </Col>
                <Col span={12}>
                    <Button type="primary" onClick={applyDateFilter}>Aplicar Filtro</Button>
                </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: '16px' }}>
                {Object.keys(measures).map((magnitude, index) => (
                    <Col span={8} key={index}>
                        <Checkbox
                            onChange={() => handleMagnitudeChange(magnitude)}
                            checked={selectedMagnitudes.includes(magnitude)}
                        >
                            {magnitude.charAt(0).toUpperCase() + magnitude.slice(1)}
                        </Checkbox>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Measures;
