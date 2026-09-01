import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// RoomCard displays a single room in a card format
function RoomCard({ room, isFavorite, onToggleFavorite }) {
  const { user } = React.useContext(AuthContext);

  const defaultImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=500';

  // Images are stored as a JSON string in the database, so we parse them
  let images = [];
  try {
    if (room.images) images = JSON.parse(room.images);
  } catch {
    images = [];
  }
  const displayImage = images.length > 0 ? images[0] : defaultImg;

  // Show "Posted X days ago" label
  const getDaysAgo = (dateString) => {
    if (!dateString) return '';
    const diffDays = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    return `Posted ${diffDays} days ago`;
  };

  return (
    <div className="room-card">
      {/* Image + status badge + favorite button */}
      <div className="room-image-wrapper">
        <img src={displayImage} alt={room.title} className="room-image" />
        <span className={`status-badge status-${room.status || 'available'}`}>
          {room.status === 'rented' ? 'Rented' : 'Available'}
        </span>
        {user && onToggleFavorite && (
          <button
            className="favorite-btn"
            onClick={(e) => { e.preventDefault(); onToggleFavorite(room); }}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      {/* Room info */}
      <div className="room-content">
        <h3 className="room-title">{room.title}</h3>
        <div className="room-location">📍 {room.location}</div>
        <div className="room-price">
          Rs. {room.price} <span style={{ fontSize: '0.9rem', color: '#777', fontWeight: 'normal' }}>/ month</span>
        </div>
        {room.created_at && (
          <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.8rem' }}>
            {getDaysAgo(room.created_at)}
          </div>
        )}
        <div className="room-footer">
          <Link to={`/room/${room.id}`} className="btn btn-primary" style={{ width: '100%' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
