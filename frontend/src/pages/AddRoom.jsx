import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addRoom } from '../services/api';

function AddRoom() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    contact: ''
  });
  const [images, setImages] = useState(['']);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      // Allow only numeric input for contact
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, contact: numericValue });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageField = () => {
    if (images.length >= 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, '']);
  };

  const removeImageField = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length === 0) {
      setImages(['']);
    } else {
      setImages(newImages);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      alert('You must be logged in to add a room');
      return navigate('/login');
    }

    if (formData.contact && formData.contact.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }

    // Filter out empty image URLs
    const validImages = images.filter(img => img.trim() !== '');

    if (validImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    try {
      await addRoom({ ...formData, images: validImages, user_id: user.id });
      alert('Room added successfully!');
      navigate('/my-rooms');
    } catch (error) {
      console.error(error);
      setError(error.message || 'Failed to add room');
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Please login to post a room.</div>;
  }

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Add New Room</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Room Title</label>
          <input type="text" name="title" className="form-control" required onChange={handleChange} placeholder="e.g. Spacious 1BHK in Thamel"/>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" className="form-control" required onChange={handleChange} placeholder="e.g. Thamel, Kathmandu"/>
        </div>
        <div className="form-group">
          <label>Rent per Month (Rs.)</label>
          <input type="number" name="price" className="form-control" required onChange={handleChange} placeholder="e.g. 15000"/>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" className="form-control" rows="4" required onChange={handleChange} placeholder="Facilities, rules, etc."></textarea>
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input 
            type="text" 
            name="contact" 
            inputMode="numeric"
            pattern="[0-9]*"
            className="form-control" 
            required 
            maxLength={10}
            value={formData.contact}
            onChange={handleChange} 
            placeholder="e.g. 98XXXXXXXX"
          />
          {formData.contact && formData.contact.length !== 10 && (
            <small style={{ color: 'red', fontSize: '0.8rem', display: 'block' }}>Contact number must be exactly 10 digits</small>
          )}
          <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formData.contact.length}/10 digits</small>
        </div>
        <div className="form-group">
          <label>Images (Optional — max 5)</label>
          <div className="image-inputs">
            {images.map((img, index) => (
              <div key={index} className="image-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control" 
                    onChange={(e) => handleImageChange(index, e.target.files[0])} 
                  />
                  <button 
                    type="button" 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => removeImageField(index)}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                {img && <img src={img} alt="Preview" style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '8px' }} />}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" className="btn btn-add-image" onClick={addImageField}>
                + Add Another Image
              </button>
            )}
          </div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={formData.contact.length > 0 && formData.contact.length !== 10}
        >
          Post Room
        </button>
      </form>
    </div>
  );
}

export default AddRoom;
