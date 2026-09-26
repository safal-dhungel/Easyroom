// routes/reviews.js
// Handles: Add a review, Get reviews for a room, Delete own review

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// --- GET REVIEWS FOR A ROOM ---
// GET /api/reviews/:room_id
// Returns all reviews for a specific room
router.get('/reviews/:room_id', async (req, res) => {
    try {
        const { room_id } = req.params;

        const [reviews] = await pool.query(`
            SELECT rv.*, u.name AS reviewer_name
            FROM reviews rv
            JOIN users u ON rv.user_id = u.id
            WHERE rv.room_id = ?
            ORDER BY rv.created_at DESC
        `, [room_id]);

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;

        res.status(200).json({ reviews, avgRating, totalReviews: reviews.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// --- ADD A REVIEW ---
// POST /api/reviews
// A user leaves a rating and comment for a room
router.post('/reviews', async (req, res) => {
    try {
        const { room_id, user_id, rating, comment } = req.body;

        if (!room_id || !user_id || !rating) {
            return res.status(400).json({ error: 'room_id, user_id, and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check that user is not reviewing their own room
        const [room] = await pool.query('SELECT user_id FROM rooms WHERE id = ?', [room_id]);
        if (room.length > 0 && room[0].user_id == user_id) {
            return res.status(400).json({ error: 'You cannot review your own room' });
        }

        const [result] = await pool.query(
            'INSERT INTO reviews (room_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [room_id, user_id, rating, comment || null]
        );

        res.status(201).json({ message: 'Review added successfully', reviewId: result.insertId });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'You have already reviewed this room' });
        }
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// --- DELETE A REVIEW ---
// DELETE /api/reviews/:id
// Only the review author can delete it
router.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'Review not found or access denied' });
        }

        await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
        res.status(200).json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
