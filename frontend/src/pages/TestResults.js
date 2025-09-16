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

const loadingStyle = {
  textAlign: 'center',
  padding: '2rem'
};

const spinnerStyle = {
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #3498db',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  animation: 'spin 1s linear infinite',
  margin: '0 auto'
};

const skeletonCardStyle = {
  width: '100%',
  maxWidth: '700px',
  height: '2rem',
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  marginBottom: '1rem',
  animation: 'pulse 1.5s infinite'
};

// Add keyframes for animations
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

const TestResults = () => {
  const { id } = useParams();
  const [expectedText, setExpectedText] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [compareIdx, setCompareIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/tests/${id}/results`);
        setExpectedText(data.expectedText);
        setSubmissions(data.submissions);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch test results');
      } finally {
        setLoading(false);
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
        label: 'Marks',
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
        title: { display: true, text: 'Marks' }
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

  // Render skeleton loaders when loading
  if (loading) {
    return (
      <div style={containerStyle}>
        <h2>Test Results</h2>
        <div style={chartContainer}>
          <div style={skeletonCardStyle}></div>
          <div style={{...skeletonCardStyle, height: '300px'}}></div>
        </div>
        
        <div style={{...chartContainer, marginTop: '2rem'}}>
          <div style={skeletonCardStyle}></div>
          <div style={{...skeletonCardStyle, height: '200px'}}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={loadingStyle}>Error: {error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2>Test Results</h2>
      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
      )}
      
      {submissions.length === 0 && !loading ? (
        <div style={loadingStyle}>No submissions found for this test.</div>
      ) : (
        <>
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
                <th style={thTdStyle}>Total Words</th>
                <th style={thTdStyle}>Correct Words</th>
                <th style={thTdStyle}>Wrong Words</th>
                <th style={thTdStyle}>Marks</th>
                <th style={thTdStyle}>WPM</th>
                <th style={thTdStyle}>Compare</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, idx) => (
                <tr key={idx}>
                  <td style={thTdStyle}>{new Date(s.createdAt).toLocaleString()}</td>
                  <td style={thTdStyle}>{s.totalWords || 0}</td>
                  <td style={thTdStyle}>{s.correctWords || 0}</td>
                  <td style={thTdStyle}>{s.wrongWords || 0}</td>
                  <td style={thTdStyle}>{s.accuracy || 0}</td>
                  <td style={thTdStyle}>{s.wpm || 0}</td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleCompare(idx)}>Compare</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Link to="/tests" style={{ marginTop: '1.5rem', textDecoration: 'none', color: '#2980b9' }}>
        ← Back to Tests
      </Link>
    </div>
  );
};

export default TestResults;
