import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById } from '../services/api';

function RoomDetails() {
  const { id } = useParams(); // get room ID from the URL e.g. /room/5
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0); // which thumbnail is selected

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const data = await getRoomById(id);
      setRoom(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  if (!room) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Room not found.</div>;

  const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200';

  // Parse the images JSON string into an array
  let images = [];
  try {
    if (room.images) images = JSON.parse(room.images);
  } catch { images = []; }

  const displayImages = images.length > 0 ? images : [defaultImg];

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const diffDays = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  return (
    <div className="details-container">
      <div className="details-header">
        <Link to="/" className="btn btn-edit" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Listings</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ color: '#4a90e2' }}>{room.title}</h1>
          <span className={`status-badge status-${room.status || 'available'}`}>
            {room.status === 'rented' ? 'Rented' : 'Available'}
          </span>
        </div>
        <div style={{ color: '#777', marginTop: '0.25rem' }}>📍 {room.location}</div>
      </div>

      {/* Main image */}
      <img src={displayImages[activeImageIndex]} alt={room.title} className="details-image" />

      {/* Thumbnail strip — only show if there are multiple images */}
      {displayImages.length > 1 && (
        <div className="image-thumbnails">
          {displayImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${room.title} ${index + 1}`}
              className={`thumbnail ${index === activeImageIndex ? 'thumbnail-active' : ''}`}
              onClick={() => setActiveImageIndex(index)}
            />
          ))}
        </div>
      )}

      <div className="details-info">
        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4a90e2', marginBottom: '1.2rem' }}>
          Rs. {room.price} <span style={{ fontSize: '1rem', color: '#777', fontWeight: 'normal' }}>/ month</span>
        </div>

        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{room.description}</p>

        <h3>Contact Information</h3>
        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', display: 'inline-block', marginTop: '0.4rem' }}>
          {room.owner_name && (
            <div style={{ marginBottom: '0.4rem' }}>
              👤 <strong>Owner:</strong> {room.owner_name}
            </div>
          )}
          <div>📞 <strong>{room.contact}</strong></div>
        </div>

        {room.created_at && (
          <div style={{ marginTop: '1.5rem', color: '#999', fontSize: '0.9rem' }}>
            📅 {getDaysAgo(room.created_at)}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomDetails;
