import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/api';

function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load the user's current profile data when the page opens
  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile(user.id);
      setFormData({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Only allow numbers in phone field
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setFormData({ ...formData, phone: value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.phone && formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const data = await updateUserProfile(user.id, formData);
      updateUser(data.user); // update the global auth state
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000); // clear message after 3 seconds
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</div>;

  return (
    <div className="form-container" style={{ maxWidth: '500px' }}>
      {/* Avatar circle showing first letter of name */}
      <div className="profile-header">
        <div className="profile-avatar">
          {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 style={{ color: '#4a90e2', marginBottom: '0.25rem' }}>My Profile</h2>
        <p style={{ color: '#777' }}>Manage your account details</p>
      </div>

      {success && <div className="alert-success">{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" className="form-control" required value={formData.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" className="form-control" required value={formData.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            inputMode="numeric"
            className="form-control"
            maxLength={10}
            placeholder="e.g. 9841234567"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
          <small style={{ color: '#777' }}>{formData.phone.length}/10 digits</small>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
