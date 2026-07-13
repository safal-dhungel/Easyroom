import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import { getFavorites, toggleFavorite } from '../services/api';

function Favorites() {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites(user.id);
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (room) => {
    try {
      await toggleFavorite(room.id, user.id);
      // Remove from list since it was unfavorited
      setFavorites(favorites.filter(f => f.id !== room.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 style={{ color: 'var(--primary-color)', marginBottom: '2rem' }}>Saved Rooms</h2>

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading favorites...</div>
      ) : favorites.length > 0 ? (
        <div className="rooms-grid">
          {favorites.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', background: 'var(--card-bg)', padding: '3rem', borderRadius: '12px' }}>
          <h3>No saved rooms.</h3>
          <p>Browse available rooms and click the heart icon to save them.</p>
        </div>
      )}
    </div>
  );
}

export default Favorites;
