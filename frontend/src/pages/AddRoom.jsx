import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { addRoom } from '../services/api';

function AddRoom() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form fields as a single state object
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    contact: ''
  });

  const [images, setImages] = useState(['']); // list of image file data
  const [error, setError] = useState('');

  // Handle changes to text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Contact field: only allow numbers, max 10 digits
    if (name === 'contact') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData({ ...formData, contact: numericValue });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  // When user picks a file, read it as base64 and store it
  const handleImageChange = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = reader.result; // base64 string
      setImages(newImages);
    };
    reader.readAsDataURL(file);
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
    setImages(newImages.length === 0 ? [''] : newImages);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.contact.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }

    const validImages = images.filter(img => img.trim() !== '');

    try {
      await addRoom({ ...formData, images: validImages, user_id: user.id });
      alert('Room added successfully!');
      navigate('/my-rooms');
    } catch (err) {
      setError(err.message || 'Failed to add room');
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#4a90e2' }}>Add New Room</h2>

      {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Room Title</label>
          <input type="text" name="title" className="form-control" required onChange={handleChange} placeholder="e.g. 1BHK near college" />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" className="form-control" required onChange={handleChange} placeholder="e.g. Thamel, Kathmandu" />
        </div>

        <div className="form-group">
          <label>Rent per Month (Rs.)</label>
          <input type="number" name="price" className="form-control" required onChange={handleChange} placeholder="e.g. 15000" />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" className="form-control" rows="4" required onChange={handleChange} placeholder="Facilities, rules, etc." />
        </div>

        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contact"
            inputMode="numeric"
            className="form-control"
            required
            maxLength={10}
            value={formData.contact}
            onChange={handleChange}
            placeholder="e.g. 98XXXXXXXX"
          />
          <small style={{ color: '#777' }}>{formData.contact.length}/10 digits</small>
        </div>

        <div className="form-group">
          <label>Images (Optional — max 5)</label>
          <div className="image-inputs">
            {images.map((img, index) => (
              <div key={index} className="image-input-row">
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
                {img && <img src={img} alt="Preview" style={{ height: '70px', width: '70px', objectFit: 'cover', borderRadius: '4px' }} />}
              </div>
            ))}
            {images.length < 5 && (
              <button type="button" className="btn-add-image" onClick={addImageField}>
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
