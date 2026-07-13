import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    // Allow only numeric input
    const value = e.target.value.replace(/\D/g, '');
    // Limit to 10 digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      await registerUser({ name, email, phone, password });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Email might already exist.');
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Create Account</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-control"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control"
            required
            maxLength={10}
            value={phone}
            onChange={handlePhoneChange}
          />
          {phone && phone.length !== 10 && (
            <small style={{ color: 'red', fontSize: '0.8rem', display: 'block' }}>Phone number must be exactly 10 digits</small>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{phone.length}/10 digits</small>
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {password && password.length < 8 && (
            <small style={{ color: 'red', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>Password must be at least 8 characters long</small>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>Minimum 8 characters</small>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={(phone && phone.length !== 10) || (password && password.length < 8)}
        >
          Register
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Login</Link>
      </div>
    </div>
  );
}

export default Register;
