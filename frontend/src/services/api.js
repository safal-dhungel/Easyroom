const BASE_URL = 'http://localhost:5000/api';

export const registerUser = async (userData) => {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
};

export const loginUser = async (credentials) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!res.ok) {
        throw new Error('Login failed');
    }
    return res.json();
};

export const getRooms = async (location = '', maxPrice = '') => {
    let url = `${BASE_URL}/rooms?`;
    if (location) url += `location=${encodeURIComponent(location)}&`;
    if (maxPrice) url += `maxPrice=${encodeURIComponent(maxPrice)}&`;
    const res = await fetch(url);
    return res.json();
};

export const getRoomById = async (id) => {
    const res = await fetch(`${BASE_URL}/rooms/${id}`);
    if (!res.ok) throw new Error('Room not found');
    return res.json();
};

export const getMyRooms = async (userId) => {
    const res = await fetch(`${BASE_URL}/my-rooms?user_id=${userId}`);
    return res.json();
};

export const addRoom = async (roomData) => {
    const res = await fetch(`${BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add room');
    return data;
};

export const updateRoom = async (roomId, roomData) => {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update room');
    return data;
};

export const updateRoomStatus = async (roomId, status, userId) => {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
};

export const getUserProfile = async (userId) => {
    const res = await fetch(`${BASE_URL}/me/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
};

export const updateUserProfile = async (userId, profileData) => {
    const res = await fetch(`${BASE_URL}/me/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
};

export const deleteRoom = async (roomId, userId) => {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete room');
    return data;
};

export const toggleFavorite = async (roomId, userId) => {
    const res = await fetch(`${BASE_URL}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to toggle favorite');
    return data;
};

export const getFavorites = async (userId) => {
    const res = await fetch(`${BASE_URL}/favorites/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return res.json();
};

export const checkServerConnection = async () => {
    try {
        const res = await fetch('http://localhost:5000/');
        if (!res.ok) throw new Error('Server not connected');
        return true;
    } catch (error) {
        throw new Error('Server not connected');
    }
};
