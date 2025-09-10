import React, { useState } from 'react';
import api from '../api';

const AdminAssign = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setMessage('Username is required.');
      return;
    }
    try {
      const res = await api.post('/admin/promote', { username });
      setMessage(res.data.message);
      setUsername('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Promotion failed.');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Assign Admin Role</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <label>Username:</label><br />
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter username"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            background: '#2980b9',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Make Admin (प्रशासक बनाएं)
        </button>
      </form>
    </div>
  );
};

export default AdminAssign;
