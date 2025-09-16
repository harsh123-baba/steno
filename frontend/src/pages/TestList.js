import React, { useState, useEffect, useContext, useMemo } from 'react';
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

const TestList = () => {
  const [tests, setTests] = useState([]);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 10;

  const fetchTests = async () => {
    try {
      const { data } = await api.get('/tests');
      // Sort by latest first (assuming tests have a createdAt field)
      const sortedTests = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTests(sortedTests);
      setCurrentPage(1); // Reset to first page when tests are fetched
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Filter tests based on search term
  const filteredTests = useMemo(() => {
    if (!searchTerm) return tests;
    return tests.filter(test => 
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tests, searchTerm]);

  // Get current tests for pagination
  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const openModal = (test = null) => {
    setEditingTest(test);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingTest(null);
    fetchTests();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await api.delete(`/admin/tests/${id}`);
        fetchTests();
      } catch (err) {
        console.error(err);
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
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div style={paginationStyle}>
        <button 
          style={buttonStyle} 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            style={number === currentPage ? activeButtonStyle : buttonStyle}
            onClick={() => handlePageChange(number)}
          >
            {number}
          </button>
        ))}
        
        <button 
          style={buttonStyle} 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div>
      <div style={searchStyle}>
        <h2>Available Tests</h2>
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={inputStyle}
        />
      </div>
      
      <div style={gridStyle}>
        {currentTests.map((test) => (
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
      
      {renderPagination()}
      
      {showModal && <UploadModal onClose={closeModal} test={editingTest} />}
    </div>
  );
};

export default TestList;
