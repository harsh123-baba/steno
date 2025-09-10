import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import UploadModal from '../components/UploadModal';

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

const TestList = () => {
  const [tests, setTests] = useState([]);
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);

  const fetchTests = async () => {
    try {
      const { data } = await api.get('/tests');
      setTests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
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

  return (
    <div>
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <h2>Available Tests</h2>
        {user && user.isAdmin && (
          <button
            onClick={openModal}
            style={{
              backgroundColor: '#2980b9',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Upload New Test
          </button>
        )}
      </div>
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
                <p style={{ margin: '0.25rem 0' }}>Time Limit: <strong>{test.timeLimit}s</strong></p>
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
                    onClick={openModal}
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
      {showModal && <UploadModal onClose={closeModal} />}
    </div>
  );
};

export default TestList;
