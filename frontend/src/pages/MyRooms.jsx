import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import { getMyRooms, updateRoom, updateRoomStatus, deleteRoom } from '../services/api';
import { Link } from 'react-router-dom';

function MyRooms() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState(['']);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyRooms();
    }
  }, [user]);

  const fetchMyRooms = async () => {
    try {
      const data = await getMyRooms(user.id);
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (room) => {
    const newStatus = room.status === 'rented' ? 'available' : 'rented';
    try {
      await updateRoomStatus(room.id, newStatus, user.id);
      setRooms(rooms.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };

  const handleDeleteRoom = async (room) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(room.id, user.id);
        setRooms(rooms.filter(r => r.id !== room.id));
      } catch (error) {
        console.error(error);
        alert('Failed to delete room');
      }
    }
  };

  const openEditModal = (room) => {
    let images = [];
    try {
      if (room.images) images = JSON.parse(room.images);
    } catch { images = []; }
    
    setEditForm({
      title: room.title,
      location: room.location,
      price: room.price,
      description: room.description || '',
      contact: room.contact
    });
    setEditImages(images.length > 0 ? images : ['']);
    setEditingRoom(room);
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setEditForm({ ...editForm, contact: numericValue });
      }
      return;
    }
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditImageChange = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...editImages];
        newImages[index] = reader.result;
        setEditImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEditImageField = () => {
    if (editImages.length >= 5) return;
    setEditImages([...editImages, '']);
  };

  const removeEditImageField = (index) => {
    const newImages = editImages.filter((_, i) => i !== index);
    setEditImages(newImages.length === 0 ? [''] : newImages);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (editForm.contact && editForm.contact.length !== 10) {
      setEditError('Contact number must be exactly 10 digits');
      return;
    }

    const validImages = editImages.filter(img => img.trim() !== '');
    if (validImages.length > 5) {
      setEditError('Maximum 5 images allowed');
      return;
    }

    try {
      await updateRoom(editingRoom.id, {
        ...editForm,
        images: validImages,
        user_id: user.id
      });
      setEditingRoom(null);
      fetchMyRooms();
    } catch (error) {
      setEditError(error.message || 'Failed to update room');
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Please login to view your rooms.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--primary-color)' }}>My Listings</h2>
        <Link to="/add-room" className="btn btn-primary">Add New Room</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading your rooms...</div>
      ) : rooms.length > 0 ? (
        <div className="my-rooms-list">
          {rooms.map(room => (
            <div key={room.id} className="my-room-item">
              <RoomCard room={room} />
              <div className="my-room-actions">
                <button className="btn btn-edit" onClick={() => openEditModal(room)}>
                  ✏️ Edit
                </button>
                <button 
                  className={`btn btn-status ${room.status === 'rented' ? 'btn-status-rented' : 'btn-status-available'}`}
                  onClick={() => handleStatusToggle(room)}
                >
                  {room.status === 'rented' ? '🔴 Rented' : '🟢 Available'}
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteRoom(room)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', background: 'var(--card-bg)', padding: '3rem', borderRadius: '12px' }}>
          <h3>You haven't posted any rooms yet.</h3>
          <Link to="/add-room" className="btn btn-primary" style={{ marginTop: '1rem' }}>Post Your First Room</Link>
        </div>
      )}

      {/* Edit Modal */}
      {editingRoom && (
        <div className="modal-overlay" onClick={() => setEditingRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Room</h2>
              <button className="modal-close" onClick={() => setEditingRoom(null)}>✕</button>
            </div>
            {editError && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Room Title</label>
                <input type="text" name="title" className="form-control" required value={editForm.title} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" className="form-control" required value={editForm.location} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Rent per Month (Rs.)</label>
                <input type="number" name="price" className="form-control" required value={editForm.price} onChange={handleEditChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-control" rows="4" required value={editForm.description} onChange={handleEditChange}></textarea>
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
                  value={editForm.contact} 
                  onChange={handleEditChange} 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{editForm.contact.length}/10 digits</small>
              </div>
              <div className="form-group">
                <label>Images (Optional — max 5)</label>
                <div className="image-inputs">
                  {editImages.map((img, index) => (
                    <div key={index} className="image-input-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          className="form-control" 
                          onChange={(e) => handleEditImageChange(index, e.target.files[0])} 
                        />
                        <button 
                          type="button" 
                          className="btn-icon btn-icon-danger" 
                          onClick={() => removeEditImageField(index)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                      {img && <img src={img} alt="Preview" style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: '8px' }} />}
                    </div>
                  ))}
                  {editImages.length < 5 && (
                    <button type="button" className="btn btn-add-image" onClick={addEditImageField}>
                      + Add Another Image
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                <button type="button" className="btn" style={{ flex: 1, background: '#e5e7eb' }} onClick={() => setEditingRoom(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRooms;
