// routes/rooms.js
// Handles: List rooms, Get one room, Add room, Edit room, Delete room, Toggle status, My rooms

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// --- GET ALL ROOMS ---
// GET /api/rooms?location=...&maxPrice=...
// Returns all rooms, with optional search filters
router.get('/rooms', async (req, res) => {
    try {
        const { location, maxPrice } = req.query;

        // Start with a base query and add filters as needed
        let query = 'SELECT * FROM rooms WHERE 1=1';
        let params = [];

        if (location) {
            query += ' AND (location LIKE ? OR title LIKE ?)';
            params.push(`%${location}%`, `%${location}%`);
        }

        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(parseInt(maxPrice));
        }

        query += ' ORDER BY id DESC';

        const [rooms] = await pool.query(query, params);
        res.status(200).json(rooms);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// --- GET ONE ROOM ---
// GET /api/rooms/:id
// Returns details for a single room, including owner name
router.get('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // JOIN with users table to get the owner's name
        const [rooms] = await pool.query(`
            SELECT r.*, u.name AS owner_name, u.phone AS owner_phone
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [id]);

        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.status(200).json(rooms[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch room details' });
    }
});

// --- GET MY ROOMS ---
// GET /api/my-rooms?user_id=...
// Returns all rooms posted by a specific user
router.get('/my-rooms', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const [rooms] = await pool.query(
            'SELECT * FROM rooms WHERE user_id = ? ORDER BY id DESC',
            [user_id]
        );

        res.status(200).json(rooms);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch your rooms' });
    }
});

// --- ADD A ROOM ---
// POST /api/rooms
// Creates a new room listing
router.post('/rooms', async (req, res) => {
    try {
        const { title, location, price, description, contact, images, user_id } = req.body;

        if (!user_id) {
            return res.status(401).json({ error: 'You must be logged in to add a room' });
        }

        // Validate contact number
        if (!contact || !/^\d{10}$/.test(contact)) {
            return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });
        }

        // Max 5 images
        if (images && Array.isArray(images) && images.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 images allowed' });
        }

        // Images are stored as a JSON string in the database (e.g. '["url1", "url2"]')
        const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;

        const [result] = await pool.query(
            'INSERT INTO rooms (title, location, price, description, contact, images, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, location, price, description, contact, imagesJson, user_id]
        );

        res.status(201).json({ message: 'Room added successfully', roomId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add room' });
    }
});

// --- UPDATE A ROOM ---
// PUT /api/rooms/:id
// Updates an existing room's details (only by the owner)
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, location, price, description, contact, images, user_id } = req.body;

        // Make sure this room belongs to the user making the request
        const [existing] = await pool.query(
            'SELECT * FROM rooms WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'You can only edit your own rooms' });
        }

        if (!contact || !/^\d{10}$/.test(contact)) {
            return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });
        }

        if (images && Array.isArray(images) && images.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 images allowed' });
        }

        const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;

        await pool.query(
            'UPDATE rooms SET title = ?, location = ?, price = ?, description = ?, contact = ?, images = ? WHERE id = ? AND user_id = ?',
            [title, location, price, description, contact, imagesJson, id, user_id]
        );

        const [updated] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        res.status(200).json({ message: 'Room updated successfully', room: updated[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// --- TOGGLE ROOM STATUS ---
// PATCH /api/rooms/:id/status
// Switches a room between "available" and "rented" (only by the owner)
router.patch('/rooms/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, user_id } = req.body;

        if (!['available', 'rented'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "available" or "rented"' });
        }

        // Only the owner can change the status
        const [existing] = await pool.query(
            'SELECT * FROM rooms WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'You can only update your own rooms' });
        }

        await pool.query(
            'UPDATE rooms SET status = ? WHERE id = ? AND user_id = ?',
            [status, id, user_id]
        );

        res.status(200).json({ message: 'Room status updated', status });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update room status' });
    }
});

// --- DELETE A ROOM ---
// DELETE /api/rooms/:id
// Removes a room (only by the owner)
router.delete('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(401).json({ error: 'You must be logged in to delete a room' });
        }

        // Only the owner can delete
        const [existing] = await pool.query(
            'SELECT * FROM rooms WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'You can only delete your own rooms' });
        }

        await pool.query('DELETE FROM rooms WHERE id = ? AND user_id = ?', [id, user_id]);
        res.status(200).json({ message: 'Room deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

module.exports = router;
