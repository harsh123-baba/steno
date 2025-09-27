import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const containerStyle = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto'
};

const headingStyle = {
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#2c3e50'
};

const plansContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '2rem'
};

const planCardStyle = {
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: '2rem',
  width: '250px',
  textAlign: 'center',
  transition: 'transform 0.3s ease'
};

const planCardHoverStyle = {
  ...planCardStyle,
  ':hover': {
    transform: 'translateY(-5px)'
  }
};

const planTitleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: '#2c3e50'
};

const priceStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  margin: '1rem 0',
  color: '#3498db'
};

const featuresListStyle = {
  listStyle: 'none',
  padding: 0,
  textAlign: 'left',
  margin: '1.5rem 0'
};

const featureItemStyle = {
  padding: '0.5rem 0',
  borderBottom: '1px solid #eee'
};

const buttonStyle = {
  backgroundColor: '#3498db',
  color: '#fff',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold',
  marginTop: '1rem'
};

const activeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#27ae60'
};

const PricingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const plans = [
    {
      id: 1,
      name: '1 Month',
      price: '₹200',
      duration: 1,
      features: [
        'Access to all premium tests',
        'Unlimited practice sessions',
        'Performance analytics',
        'Priority support'
      ]
    },
    {
      id: 2,
      name: '2 Months',
      price: '₹300',
      duration: 2,
      features: [
        'Access to all premium tests',
        'Unlimited practice sessions',
        'Performance analytics',
        'Priority support',
        '5% savings'
      ]
    },
    {
      id: 3,
      name: '3 Months',
      price: '₹400',
      duration: 3,
      features: [
        'Access to all premium tests',
        'Unlimited practice sessions',
        'Performance analytics',
        'Priority support',
        '10% savings'
      ]
    },
    {
      id: 4,
      name: '6 Months',
      price: '₹500',
      duration: 6,
      features: [
        'Access to all premium tests',
        'Unlimited practice sessions',
        'Performance analytics',
        'Priority support',
        '20% savings'
      ]
    }
  ];

  const handleSubscribe = (plan) => {
    // In a real application, this would integrate with a payment gateway
    alert(`Thank you for subscribing to the ${plan.name} plan for ${plan.price}! In a real application, this would redirect to a payment gateway.`);
    // For demo purposes, we'll just show an alert
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Choose Your Plan</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Get access to all premium tests and features with our flexible subscription plans.
      </p>
      
      <div style={plansContainerStyle}>
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            style={planCardHoverStyle}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h2 style={planTitleStyle}>{plan.name}</h2>
            <div style={priceStyle}>{plan.price}</div>
            <ul style={featuresListStyle}>
              {plan.features.map((feature, index) => (
                <li key={index} style={featureItemStyle}>✓ {feature}</li>
              ))}
            </ul>
            {user && user.isPremium ? (
              <button style={activeButtonStyle} disabled>
                Already Subscribed
              </button>
            ) : (
              <button style={buttonStyle} onClick={() => handleSubscribe(plan)}>
                Get Started
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h3>Why Choose Premium?</h3>
        <p>Premium members get access to exclusive content, advanced features, and priority support.</p>
      </div>
    </div>
  );
};

export default PricingPage;
