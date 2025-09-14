import React, { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);
  let expiryDate = user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  let daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome to Steno</h2>
      {user ? (
        <div>
          <p>Subscription Type: {user.subscriptionType}</p>
          <p>
            Subscription Start: {user.subscriptionStart ? new Date(user.subscriptionStart).toLocaleDateString() : '—'}
          </p>
          <p style={{ color: daysLeft !== null && daysLeft <= 7 ? 'red' : 'inherit' }}>
            Subscription Expiry: {expiryDate ? expiryDate.toLocaleDateString() : '—'}
            {expiryDate && daysLeft !== null ? ` (${daysLeft} days left)` : ''}
          </p>
          {user.subscriptionType === 'simple' && (
            <p>You are a Simple User. Upgrade to Premium for more features.</p>
          )}
        </div>
      ) : (
        <p>Select a test to begin.</p>
      )}
    </div>
  );
}

export default Home;
