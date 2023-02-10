import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Graph = ({ measures }) => {
  const chartContainer = useRef(null);

  const exampleMeasures = {
    chest: 20,
    shoulders: 25,
    biceps: 10,
    hips: 30,
    abdomen: 15,
    cuadriceps: 20,
    gemelos: 18,
  };

  useEffect(() => {
    const chart = new Chart(chartContainer.current, {
      type: 'bar',
      data: {
        labels: Object.keys(measures || exampleMeasures),
        datasets: [
          {
            label: 'Medidas',
            data: Object.values(measures || exampleMeasures),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [measures]);

  return (
    <div>
      <canvas ref={chartContainer} />
    </div>
  );
};

export default Graph;
