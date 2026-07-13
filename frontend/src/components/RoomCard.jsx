import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RoomCard({ room, isFavorite, onToggleFavorite }) {
  const { user } = useContext(AuthContext);
  const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=500';
  
  // Parse images from JSON string
  let images = [];
  try {
    if (room.images) {
      images = JSON.parse(room.images);
    }
  } catch {
    images = [];
  }
  const displayImage = images.length > 0 ? images[0] : defaultImg;

  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  return (
    <div className="room-card">
      <div className="room-image-wrapper">
        <img 
          src={displayImage} 
          alt={room.title} 
          className="room-image"
        />
        <span className={`status-badge status-${room.status || 'available'}`}>
          {room.status === 'rented' ? 'Rented' : 'Available'}
        </span>
        {user && onToggleFavorite && (
          <button 
            className="favorite-btn"
            onClick={(e) => { e.preventDefault(); onToggleFavorite(room); }}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="room-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className="room-title">{room.title}</h3>
        </div>
        <div className="room-location">
          📍 {room.location}
        </div>
        <div className="room-price">
          Rs. {room.price} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ month</span>
        </div>
        {room.created_at && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {getDaysAgo(room.created_at)}
          </div>
        )}
        <div className="room-footer">
          <Link to={`/room/${room.id}`} className="btn btn-primary" style={{width: '100%'}}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
