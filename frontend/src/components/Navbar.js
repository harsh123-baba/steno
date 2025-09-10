import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#2c3e50'
    }}>
      <div>
        <Link to="/" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
        {user && (
          <>
            <Link to="/tests" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Tests</Link>
            <Link to="/results" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Results</Link>
        {user.isAdmin && (
          <>
            <Link to="/admin/upload" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Upload</Link>
            <Link to="/admin/assign" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Assign</Link>
          </>
        )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#e74c3c',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#ecf0f1', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
