// routes/favorites.js
// Handles: Save/unsave a room, Get saved rooms

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// --- TOGGLE FAVORITE ---
// POST /api/favorites/toggle
// If the room is already saved, remove it. If not, save it.
router.post('/favorites/toggle', async (req, res) => {
    try {
        const { user_id, room_id } = req.body;

        if (!user_id || !room_id) {
            return res.status(400).json({ error: 'user_id and room_id are required' });
        }

        // Check if this room is already in the user's favorites
        const [existing] = await pool.query(
            'SELECT * FROM favorites WHERE user_id = ? AND room_id = ?',
            [user_id, room_id]
        );

        if (existing.length > 0) {
            // Already saved — remove it
            await pool.query(
                'DELETE FROM favorites WHERE user_id = ? AND room_id = ?',
                [user_id, room_id]
            );
            res.status(200).json({ message: 'Removed from favorites', isFavorited: false });
        } else {
            // Not saved yet — add it
            await pool.query(
                'INSERT INTO favorites (user_id, room_id) VALUES (?, ?)',
                [user_id, room_id]
            );
            res.status(200).json({ message: 'Added to favorites', isFavorited: true });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// --- GET FAVORITES ---
// GET /api/favorites/:user_id
// Returns all rooms that a user has saved
router.get('/favorites/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // JOIN rooms and favorites to get full room details
        const [favorites] = await pool.query(`
            SELECT r.*
            FROM rooms r
            JOIN favorites f ON r.id = f.room_id
            WHERE f.user_id = ?
            ORDER BY f.id DESC
        `, [user_id]);

        res.status(200).json(favorites);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

module.exports = router;
