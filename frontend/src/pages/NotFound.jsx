import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: '900',
        color: 'var(--primary-color)',
        lineHeight: 1,
        marginBottom: '0.5rem',
      }}>
        404
      </div>
      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: 'var(--text-color)',
        marginBottom: '1rem',
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '1.1rem',
        maxWidth: '400px',
        marginBottom: '2rem',
        lineHeight: 1.6,
      }}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
        ← Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
