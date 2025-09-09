import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const containerStyle = {
  padding: '1rem'
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1rem'
};
const thTdStyle = {
  border: '1px solid #ccc',
  padding: '0.5rem',
  textAlign: 'center'
};

const ResultsOverview = () => {
  const [overview, setOverview] = useState([]);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get('/tests/results/all');
        setOverview(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOverview();
  }, []);

  // Compute averages
  const rows = overview.map((group) => {
    const { test, submissions } = group;
    const avgAcc = submissions.length
      ? Math.round(submissions.reduce((sum, s) => sum + s.accuracy, 0) / submissions.length)
      : 0;
    const avgWpm = submissions.length
      ? Math.round(submissions.reduce((sum, s) => sum + s.wpm, 0) / submissions.length)
      : 0;
    return {
      id: test.id,
      name: test.name,
      category: test.category,
      attempts: submissions.length,
      avgAcc,
      avgWpm
    };
  });

  return (
    <div style={containerStyle}>
      <h2>All Tests Overview</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Test Name</th>
            <th style={thTdStyle}>Category</th>
            <th style={thTdStyle}>Attempts</th>
            <th style={thTdStyle}>Avg Accuracy (%)</th>
            <th style={thTdStyle}>Avg WPM</th>
            <th style={thTdStyle}>Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={thTdStyle}>{r.name}</td>
              <td style={thTdStyle}>{r.category.toUpperCase()}</td>
              <td style={thTdStyle}>{r.attempts}</td>
              <td style={thTdStyle}>{r.avgAcc}</td>
              <td style={thTdStyle}>{r.avgWpm}</td>
              <td style={thTdStyle}>
                <Link to={`/tests/${r.id}/results`} style={{ color: '#2980b9' }}>
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsOverview;
