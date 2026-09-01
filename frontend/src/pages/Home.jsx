import React, { useState, useEffect, useContext } from 'react';
import RoomCard from '../components/RoomCard';
import { getRooms, getFavorites, toggleFavorite } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [favorites, setFavorites] = useState([]); // list of favorited room IDs
  const [loading, setLoading] = useState(true);

  // Fetch favorites when user is logged in
  useEffect(() => {
    if (user) fetchUserFavorites();
  }, [user]);

  // Fetch rooms whenever search or price filter changes (with a small delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms(search, maxPrice);
    }, 500); // wait 500ms after user stops typing
    return () => clearTimeout(timer);
  }, [search, maxPrice]);

  const fetchUserFavorites = async () => {
    try {
      const data = await getFavorites(user.id);
      setFavorites(data.map(f => f.id)); // store just the IDs
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
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#4a90e2' }}>Find Your Perfect Room</h1>
        <p style={{ color: '#777' }}>Browse and rent rooms in your preferred location.</p>
      </div>

      {/* Search filters */}
      <form className="search-container" onSubmit={(e) => e.preventDefault()}>
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
          style={{ maxWidth: '160px' }}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </form>

      {/* Room listing */}
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
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#777' }}>
          <h3>No rooms found.</h3>
        </div>
      )}
    </div>
  );
}

export default Home;
