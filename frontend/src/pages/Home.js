import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Home = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    );
  }

  const pageStyles = {
    minHeight: '100vh',
    background: 'linear-gradient(to right, #6a11cb, #2575fc)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      textAlign: 'center',
      maxWidth: '500px'
    },
    button: {
      marginTop: '1rem',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#6a11cb',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    link: {
      color: '#6a11cb',
      textDecoration: 'none',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={pageStyles}>
      <div style={styles.container}>
        {user ? (
          <>
            <h1>Welcome, {user.username}!</h1>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
          </>
        ) : (
          <>
            <h1>Welcome to Hindi Typing Test</h1>
            <p>
              Please{' '}
              <Link to="/login" style={styles.link}>
                login
              </Link>{' '}
              or{' '}
              <Link to="/register" style={styles.link}>
                register
              </Link>{' '}
              to take tests.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
