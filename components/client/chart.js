import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';

const data = [
  { date: '2020-01-01', type1: 40, type2: 24 },
  { date: '2020-01-02', type1: 30, type2: 13 },
  { date: '2020-01-03', type1: 20, type2: 98 },
  { date: '2020-01-04', type1: 27, type2: 39 },
  { date: '2020-01-05', type1: 19, type2: 48 },
  { date: '2020-01-06', type1: 23, type2: 38 },
  { date: '2020-01-07', type1: 35, type2: 43 },
];

const FilterableLineChart = () => {
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2020-01-07');

  const filteredData = data.filter(
    (d) => d.date >= startDate && d.date <= endDate
  );

  return (
    <div
      style={{
        width: '80%',
        height: '80vh',
        paddingTop: '20vh',
        margin: 'auto',
      }}
    >
      <ResponsiveContainer>
        <LineChart
          data={filteredData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='date' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type='monotone' dataKey='type1' stroke='#8884d8' />
          <Line type='monotone' dataKey='type2' stroke='#82ca9d' />
        </LineChart>
      </ResponsiveContainer>
      <input
        type='range'
        min='2020-01-01'
        max='2020-01-07'
        step='1'
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type='range'
        min='2020-01-01'
        max='2020-01-07'
        step='1'
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </div>
  );
};

export default FilterableLineChart;
