const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Toggle favorite status
router.post('/favorites/toggle', async (req, res) => {
    try {
        const { user_id, room_id } = req.body;
        
        if (!user_id || !room_id) {
            return res.status(400).json({ error: 'user_id and room_id are required' });
        }

        // Check if already favorited
        const [existing] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND room_id = ?', [user_id, room_id]);
        
        if (existing.length > 0) {
            // Remove from favorites
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND room_id = ?', [user_id, room_id]);
            res.status(200).json({ message: 'Removed from favorites', isFavorited: false });
        } else {
            // Add to favorites
            await pool.query('INSERT INTO favorites (user_id, room_id) VALUES (?, ?)', [user_id, room_id]);
            res.status(200).json({ message: 'Added to favorites', isFavorited: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// Get user's favorite rooms
router.get('/favorites/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const query = `
            SELECT r.* 
            FROM rooms r
            JOIN favorites f ON r.id = f.room_id
            WHERE f.user_id = ?
            ORDER BY f.id DESC
        `;
        const [favorites] = await pool.query(query, [user_id]);
        res.status(200).json(favorites);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

module.exports = router;
