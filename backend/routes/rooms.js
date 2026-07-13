const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// Get all rooms (with optional location filter)
router.get('/rooms', async (req, res) => {
    try {
        const { location, maxPrice } = req.query;
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

// Get a single room by ID
router.get('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rooms] = await pool.query(`
            SELECT r.*, u.name as owner_name, u.phone as owner_phone
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [id]);
        
        if (rooms.length > 0) {
            res.status(200).json(rooms[0]);
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch room details' });
    }
});

// Add a new room
router.post('/rooms', async (req, res) => {
    try {
        const { title, location, price, description, contact, images, user_id } = req.body;
        
        if (!user_id) {
            return res.status(401).json({ error: 'User must be logged in to add a room' });
        }

        // Validate contact: numeric only, exactly 10 digits
        if (!contact || !/^\d{10}$/.test(contact)) {
            return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });
        }

        // Validate images: max 5
        if (images && Array.isArray(images) && images.length > 5) {
            return res.status(400).json({ error: 'Maximum 5 images allowed' });
        }

        // Store images as JSON string
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

// Update a room
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, location, price, description, contact, images, user_id } = req.body;

        // Verify room belongs to user
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ? AND user_id = ?', [id, user_id]);
        if (existing.length === 0) {
            return res.status(403).json({ error: 'You can only edit your own rooms' });
        }

        // Validate contact: numeric only, exactly 10 digits
        if (!contact || !/^\d{10}$/.test(contact)) {
            return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });
        }

        // Validate images: max 5
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

// Toggle room status
router.patch('/rooms/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, user_id } = req.body;

        if (!['available', 'rented'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "available" or "rented"' });
        }

        // Verify room belongs to user
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ? AND user_id = ?', [id, user_id]);
        if (existing.length === 0) {
            return res.status(403).json({ error: 'You can only update your own rooms' });
        }

        await pool.query('UPDATE rooms SET status = ? WHERE id = ? AND user_id = ?', [status, id, user_id]);
        res.status(200).json({ message: 'Room status updated successfully', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update room status' });
    }
});

// Get rooms by user ID (My Listings)
router.get('/my-rooms', async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }
        
        const [rooms] = await pool.query('SELECT * FROM rooms WHERE user_id = ? ORDER BY id DESC', [user_id]);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user rooms' });
    }
});

// Delete a room
router.delete('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body; // or req.query depending on how frontend sends it, let's use req.body to match toggles

        if (!user_id) {
            return res.status(401).json({ error: 'User must be logged in to delete a room' });
        }

        // Verify room belongs to user
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ? AND user_id = ?', [id, user_id]);
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
