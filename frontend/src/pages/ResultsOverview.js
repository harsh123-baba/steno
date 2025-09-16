import React, { useState, useEffect, useCallback } from 'react';
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

const skeletonRowStyle = {
  height: '2rem',
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  marginBottom: '0.5rem',
  animation: 'pulse 1.5s infinite'
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '1rem',
  gap: '0.5rem'
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  border: '1px solid #ddd',
  backgroundColor: '#f5f5f5',
  cursor: 'pointer'
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#3498db',
  color: '#fff'
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

const ResultsOverview = () => {
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 10;

  const fetchOverview = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tests/results/all', {
        params: {
          page: page,
          limit: resultsPerPage
        }
      });
      setOverview(response.data.results);
      setTotalPages(response.data.pagination.totalPages);
      setTotalResults(response.data.pagination.totalResults);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch results overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(currentPage);
  }, [fetchOverview, currentPage]);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // Show first page, last page, current page, and nearby pages
    const delta = 2; // Number of pages to show around current page
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pageNumbers.push(i);
      } else if (
        i === currentPage - delta - 1 || 
        i === currentPage + delta + 1
      ) {
        // Add ellipsis
        pageNumbers.push('...');
      }
    }

    return (
      <div style={paginationStyle}>
        <button 
          style={buttonStyle} 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
        >
          Previous
        </button>
        
        {pageNumbers.map((number, index) => (
          number === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: '0.5rem' }}>...</span>
          ) : (
            <button
              key={number}
              style={number === currentPage ? activeButtonStyle : buttonStyle}
              onClick={() => handlePageChange(number)}
              disabled={loading}
            >
              {number}
            </button>
          )
        ))}
        
        <button 
          style={buttonStyle} 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
        >
          Next
        </button>
      </div>
    );
  };

  // Render skeleton loaders when loading and no data is available
  if (loading && overview.length === 0) {
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
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
                <td style={thTdStyle}><div style={skeletonRowStyle}></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return <div style={loadingStyle}>Error: {error}</div>;
  }

  return (
    <div style={containerStyle}>
      <h2>All Tests Overview {totalResults > 0 && `(${totalResults})`}</h2>
      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
      )}
      
      {rows.length === 0 && !loading ? (
        <div style={loadingStyle}>No test results available.</div>
      ) : (
        <>
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
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ResultsOverview;
