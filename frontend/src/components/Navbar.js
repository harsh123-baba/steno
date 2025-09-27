import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate days remaining in subscription
  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#2c3e50',
    }}>
      <div>
        <Link to="/" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
        {user && (
          <>
            <Link to="/tests" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Tests</Link>
            <Link to="/results" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Results</Link>
            <Link to="/pricing" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Pricing</Link>
            {user.isAdmin && (
              <>
                <Link to="/admin/upload" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Upload</Link>
                <Link to="/admin/assign" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Assign</Link>
                <Link to="/admin/users" style={{ color: '#ecf0f1', marginRight: '1rem', textDecoration: 'none' }}>Users</Link>
              </>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
              </svg>
              Profile
            </button>

            {isProfileOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                backgroundColor: '#fff',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                minWidth: '250px',
                zIndex: 100,
                padding: '1rem',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{user.username}</h3>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }}>{user.email}</p>
                </div>

                <div style={{ marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid #ecf0f1', borderBottom: '1px solid #ecf0f1' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Account Info</h4>
                  <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}><strong>Phone:</strong> {user.phone}</p>
                  <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}><strong>Role:</strong> {user.isAdmin ? 'Admin' : 'User'}</p>
                </div>

                <div style={{ marginBottom: '1rem', padding: '0.5rem 0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Subscription</h4>
                  <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}><strong>Type:</strong> {user.subscriptionType || 'None'}</p>
                  {user.subscriptionStart && (
                    <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}><strong>Start Date:</strong> {formatDate(user.subscriptionStart)}</p>
                  )}
                  {user.subscriptionExpiry && (
                    <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      <strong>End Date:</strong> {formatDate(user.subscriptionExpiry)} 
                      {getDaysRemaining(user.subscriptionExpiry) > 0 ? 
                        ` (${getDaysRemaining(user.subscriptionExpiry)} days remaining)` : 
                        ' (Expired)'}
                    </p>
                  )}
                  {!user.subscriptionStart && <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}><strong>Status:</strong> No active subscription</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/pricing');
                    }}
                    style={{
                      backgroundColor: '#2ecc71',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    View Plans
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
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
