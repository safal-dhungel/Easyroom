import React from 'react';
import { Link } from 'react-router-dom';

// This page is shown when someone visits a URL that doesn't exist
function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '5rem', padding: '2rem' }}>
      <div style={{ fontSize: '6rem', fontWeight: 'bold', color: '#4a90e2' }}>404</div>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#333' }}>Page Not Found</h2>
      <p style={{ color: '#777', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">← Back to Home</Link>
    </div>
  );
}

export default NotFound;
