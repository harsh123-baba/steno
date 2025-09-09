import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import DiffViewer from '../components/DiffViewer';



const containerStyle = {
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const chartContainer = {
  width: '100%',
  maxWidth: '700px',
  marginBottom: '2rem'
};

const tableStyle = {
  width: '100%',
  maxWidth: '700px',
  borderCollapse: 'collapse',
  marginTop: '1rem'
};

const thTdStyle = {
  border: '1px solid #ccc',
  padding: '0.5rem',
  textAlign: 'center'
};

const compareContainer = {
  width: '100%',
  maxWidth: '700px',
  background: '#fff',
  border: '1px solid #ccc',
  padding: '1rem',
  marginTop: '1rem'
};

const TestResults = () => {
  const { id } = useParams();
  const [expectedText, setExpectedText] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [compareIdx, setCompareIdx] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get(`/tests/${id}/results`);
        setExpectedText(data.expectedText);
        setSubmissions(data.submissions);
      } catch (err) {
        console.error(err);
      }
    };
    fetchResults();
  }, [id]);

  // Chart data
  const labels = submissions.map(s =>
    new Date(s.createdAt).toLocaleString()
  );
  const accuracyData = submissions.map(s => s.accuracy);
  const wpmData = submissions.map(s => s.wpm);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Accuracy (%)',
        data: accuracyData,
        borderColor: '#2980b9',
        backgroundColor: 'rgba(41, 128, 185, 0.2)',
        yAxisID: 'y1'
      },
      {
        label: 'WPM',
        data: wpmData,
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        yAxisID: 'y2'
      }
    ]
  };
  const options = {
    responsive: true,
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Accuracy (%)' }
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'WPM' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  const handleCompare = (idx) => {
    setCompareIdx(idx);
  };

  const closeCompare = () => {
    setCompareIdx(null);
  };

  return (
    <div style={containerStyle}>
      <h2>Test Results</h2>
      <div style={chartContainer}>
        <Line data={chartData} options={options} />
      </div>

      {compareIdx !== null && (
        <div style={compareContainer}>
          <h3>Original vs Typed Comparison</h3>
          <div className="kruti-text">
            <DiffViewer
              original={expectedText}
              typed={submissions[compareIdx].typedText}
            />
          </div>

          <button onClick={closeCompare} style={{ marginTop: '1rem' }}>
            Close Comparison
          </button>
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Attempt Time</th>
            <th style={thTdStyle}>Errors</th>
            <th style={thTdStyle}>Accuracy (%)</th>
            <th style={thTdStyle}>WPM</th>
            <th style={thTdStyle}>Compare</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => (
            <tr key={idx}>
              <td style={thTdStyle}>{new Date(s.createdAt).toLocaleString()}</td>
              <td style={thTdStyle}>{s.errors}</td>
              <td style={thTdStyle}>{s.accuracy}</td>
              <td style={thTdStyle}>{s.wpm}</td>
              <td style={thTdStyle}>
                <button onClick={() => handleCompare(idx)}>Compare</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/tests" style={{ marginTop: '1.5rem', textDecoration: 'none', color: '#2980b9' }}>
        ← Back to Tests
      </Link>
    </div>
  );
};

export default TestResults;
