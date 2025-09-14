import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTypeChange = (id, value) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const newUser = { ...user, subscriptionType: value };
        if (value === 'premium') {
          const start = user.subscriptionStart ? new Date(user.subscriptionStart) : new Date();
          const expiry = new Date(start);
          expiry.setMonth(expiry.getMonth() + (user.subscriptionTenure > 0 ? user.subscriptionTenure : 1));
          newUser.subscriptionStart = start.toISOString();
          newUser.subscriptionExpiry = expiry.toISOString();
          newUser.subscriptionTenure = user.subscriptionTenure > 0 ? user.subscriptionTenure : 1;
        } else {
          newUser.subscriptionTenure = 0;
          newUser.subscriptionStart = null;
          newUser.subscriptionExpiry = null;
        }
        return newUser;
      }
      return user;
    }));
  };

  const handleTenureChange = (id, value) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        const start = user.subscriptionStart ? new Date(user.subscriptionStart) : new Date();
        const expiry = new Date(start);
        expiry.setMonth(expiry.getMonth() + value);
        return {
          ...user,
          subscriptionTenure: value,
          subscriptionStart: start.toISOString(),
          subscriptionExpiry: expiry.toISOString()
        };
      }
      return user;
    }));
  };

  const handleSave = async (id) => {
    const user = users.find(u => u.id === id);
    try {
      const res = await api.post('/admin/userRole', {
        id,
        subscriptionType: user.subscriptionType || 'simple',
        subscriptionTenure: user.subscriptionTenure || 0
      });
      setMessage(res.data.message);
      fetchUsers();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
      console.error('Update subscription error:', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>User Management</h2>
      {message && <p>{message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Username</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Phone</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Admin</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Subscription</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Tenure (months)</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Start</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Expiry</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const expiryDate = u.subscriptionExpiry ? new Date(u.subscriptionExpiry) : null;
            const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;
            return (
              <tr key={u.id}>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{u.username}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{u.email}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{u.phone}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{u.isAdmin ? 'Yes' : 'No'}</td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  <select
                    value={u.subscriptionType || 'simple'}
                    onChange={e => handleTypeChange(u.id, e.target.value)}
                  >
                    <option value="simple">Simple User</option>
                    <option value="premium">Premium User</option>
                  </select>
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  {u.subscriptionType === 'premium' ? (
                    <select
                      value={u.subscriptionTenure || 1}
                      onChange={e => handleTenureChange(u.id, Number(e.target.value))}
                    >
                      {[1, 2, 3, 6, 12].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  {u.subscriptionStart ? new Date(u.subscriptionStart).toLocaleDateString() : '—'}
                </td>
                <td style={{
                  border: '1px solid #ccc',
                  padding: '0.5rem',
                  color: daysLeft !== null && daysLeft <= 7 ? 'red' : 'inherit'
                }}>
                  {expiryDate ? expiryDate.toLocaleDateString() : '—'}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>
                  <button onClick={() => handleSave(u.id)}>Save</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
