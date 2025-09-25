import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import UploadModal from '../components/UploadModal';
import { formatTime } from '../utils/timeUtils';

const gridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  padding: '1rem'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const searchStyle = {
  padding: '1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const inputStyle = {
  padding: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ddd',
  width: '300px'
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

const loadingStyle = {
  textAlign: 'center',
  padding: '2rem'
};

const skeletonCardStyle = {
  backgroundColor: '#fff',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: '1rem'
};

const skeletonLineStyle = {
  height: '1rem',
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
  marginBottom: '0.5rem'
};

const skeletonCircleStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#e0e0e0',
  animation: 'spin 1s linear infinite'
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

const TestList = () => {
  const [tests, setTests] = useState([]);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const testsPerPage = 5;

  const fetchTests = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tests', {
        params: {
          page: page,
          limit: testsPerPage,
          search: search
        }
      });
      
      setTests(response.data.tests);
      setTotalPages(response.data.pagination.totalPages);
      setTotalTests(response.data.pagination.totalTests);
      setCurrentPage(response.data.pagination.currentPage);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests(currentPage, searchTerm);
  }, [fetchTests, currentPage, searchTerm]);

  const openModal = (test = null) => {
    setEditingTest(test);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingTest(null);
    fetchTests(currentPage, searchTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.delete(`/admin/tests/${id}`);
        fetchTests(currentPage, searchTerm);
      } catch (err) {
        console.error(err);
        setError('Failed to delete test');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const delta = 2;
    
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

  // Render skeleton loaders when loading and no tests are available
  if (loading && tests.length === 0) {
    return (
      <div>
        <div style={searchStyle}>
          <h2>Available Tests</h2>
          <div style={{...inputStyle, backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite'}}></div>
        </div>
        
        <div style={gridStyle}>
          {[...Array(3)].map((_, index) => (
            <div key={index} style={skeletonCardStyle}>
              <div style={{ flex: 1 }}>
                <div style={{...skeletonLineStyle, width: '60%', height: '1.5rem', marginBottom: '1rem'}}></div>
                <div style={{...skeletonLineStyle, width: '40%'}}></div>
                <div style={{...skeletonLineStyle, width: '30%'}}></div>
                <div style={{...skeletonLineStyle, width: '35%'}}></div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{...skeletonLineStyle, width: '60px', height: '30px'}}></div>
                <div style={{...skeletonLineStyle, width: '60px', height: '30px'}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div style={loadingStyle}>Error: {error}</div>;
  }

  return (
    <div>
      <div style={searchStyle}>
        <h2>Available Tests {totalTests > 0 && `(${totalTests})`}</h2>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={inputStyle}
        />
      </div>
      
      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
        </div>
      )}
      
      <div style={gridStyle}>
        {tests.map((test) => (
          <div key={test.id} style={cardStyle}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                <Link to={`/tests/${test.id}`} style={{ textDecoration: 'none', color: '#2c3e50', fontSize: '1.2rem' }}>
                  {test.name}
                </Link>
              </h3>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <p style={{ margin: '0.25rem 0' }}>Category: <strong>{test.category.toUpperCase()}</strong></p>
                  <p style={{ margin: '0.25rem 0' }}>Time Limit: <strong>{formatTime(test.timeLimit)}</strong></p>
                  <p style={{ margin: '0.25rem 0' }}>Dictation WPM: <strong>{test.dictationWpm}</strong></p>
                  <p style={{ margin: '0.25rem 0' }}>Word Count: <strong>{test.wordCount}</strong></p>
                  <p style={{ margin: '0.25rem 0' }}>Audio duration: <strong>{formatTime(test.audioDuration)}</strong></p>

                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/tests/${test.id}`}>
                <button
                  style={{
                    backgroundColor: '#3498db',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Play
                </button>
              </Link>
              {user && user.isAdmin && (
                <>
                  <button
                    onClick={() => handleDelete(test.id)}
                    style={{
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openModal(test)}
                    style={{
                      backgroundColor: '#27ae60',
                      color: '#fff',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit 
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {tests.length === 0 && !loading && (
        <div style={loadingStyle}>
          {searchTerm ? 'No tests found matching your search.' : 'No tests available.'}
        </div>
      )}
      
      {renderPagination()}
      
      {showModal && <UploadModal onClose={closeModal} test={editingTest} />}
    </div>
  );
};

export default TestList;
