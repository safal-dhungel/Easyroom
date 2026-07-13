import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById } from '../services/api';

function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  if (!room) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Room not found.</div>;

  const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200';

  // Parse images
  let images = [];
  try {
    if (room.images) images = JSON.parse(room.images);
  } catch { images = []; }
  
  const displayImages = images.length > 0 ? images : [defaultImg];

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  return (
    <div className="details-container">
      <div className="details-header">
        <Link to="/" className="btn" style={{ marginBottom: '1rem', background: '#e5e7eb' }}>&larr; Back to Listings</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>{room.title}</h1>
          <span className={`status-badge status-${room.status || 'available'}`}>
            {room.status === 'rented' ? 'Rented' : 'Available'}
          </span>
        </div>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>📍 {room.location}</div>
      </div>
      
      {/* Main Image */}
      <img src={displayImages[activeImageIndex]} alt={room.title} className="details-image" />
      
      {/* Thumbnails */}
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
        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
          Rs. {room.price} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ month</span>
        </div>
        
        <h3>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{room.description}</p>
        
        <h3>Contact Information</h3>
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
          {room.owner_name && (
            <div style={{ marginBottom: '0.5rem' }}>
              👤 <strong>Owner:</strong> {room.owner_name}
            </div>
          )}
          <div>
            📞 <strong>{room.contact}</strong>
          </div>
        </div>
        
        {room.created_at && (
          <div style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            📅 {getDaysAgo(room.created_at)}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomDetails;
