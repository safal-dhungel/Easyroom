import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import { getFavorites, toggleFavorite } from '../services/api';

function Favorites() {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
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

  // When user un-hearts a room, remove it from the list
  const handleToggleFavorite = async (room) => {
    try {
      await toggleFavorite(room.id, user.id);
      setFavorites(favorites.filter(f => f.id !== room.id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading favorites...</div>;

  return (
    <div>
      <h2 style={{ color: '#4a90e2', marginBottom: '1.5rem' }}>Saved Rooms</h2>

      {favorites.length > 0 ? (
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
        <div style={{ textAlign: 'center', marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ color: '#555' }}>No saved rooms yet.</h3>
          <p style={{ color: '#777', marginTop: '0.5rem' }}>Browse rooms and click ❤️ to save them here.</p>
        </div>
      )}
    </div>
  );
}

export default Favorites;
