import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import UploadModal from '../components/UploadModal';

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1rem',
  padding: '1rem'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
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
          <div key={test._id} style={cardStyle}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>
                <Link to={`/tests/${test._id}`} style={{ textDecoration: 'none', color: '#2c3e50' }}>
                  {test.name}
                </Link>
                <Link to={`/tests/${test._id}/results`} style={{ textDecoration: 'none', color: '#2980b9', marginTop: '0.5rem', display: 'block' }}>
                  View Results
                </Link>
              </h3>
              <p style={{ margin: '0.25rem 0' }}>Category: <strong>{test.category.toUpperCase()}</strong></p>
              <p style={{ margin: '0.25rem 0' }}>Time Limit: <strong>{test.timeLimit}s</strong></p>
            </div>
            {user && user.isAdmin && (
              <button
                onClick={openModal}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit / Upload
              </button>
            )}
          </div>
        ))}
      </div>
      {showModal && <UploadModal onClose={closeModal} />}
    </div>
  );
};

export default TestList;
