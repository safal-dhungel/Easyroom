import React, { useState, useEffect, useContext } from 'react';
import RoomCard from '../components/RoomCard';
import { getRooms, getFavorites, toggleFavorite } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRooms(search, maxPrice);
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, maxPrice]);

  const fetchUserFavorites = async () => {
    try {
      const data = await getFavorites(user.id);
      setFavorites(data.map(f => f.id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRooms = async (searchQuery = '', maxP = '') => {
    try {
      setLoading(true);
      const data = await getRooms(searchQuery, maxP);
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleToggleFavorite = async (room) => {
    if (!user) return;
    try {
      const data = await toggleFavorite(room.id, user.id);
      if (data.isFavorited) {
        setFavorites([...favorites, room.id]);
      } else {
        setFavorites(favorites.filter(id => id !== room.id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
          Find Your Perfect Room
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
          EasyRoom makes it simple to find and rent a room in your preferred location.
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-container">
        <input 
          type="text" 
          placeholder="Search by location or title..." 
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input 
          type="number" 
          placeholder="Max Price (Rs.)" 
          className="search-input"
          style={{ maxWidth: '150px' }}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading rooms...</div>
      ) : rooms.length > 0 ? (
        <div className="rooms-grid">
          {rooms.map(room => (
            <RoomCard 
              key={room.id} 
              room={room} 
              isFavorite={favorites.includes(room.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
          <h3>No rooms available.</h3>
        </div>
      )}
    </div>
  );
}

export default Home;
