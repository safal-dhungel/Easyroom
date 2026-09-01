const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcrypt');

// --- USERS MANAGEMENT ---

// Get all users
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, phone FROM users ORDER BY id DESC');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Update a user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone || null, id]
        );

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting the admin account
        const [rows] = await pool.query('SELECT email FROM users WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].email === 'admin@gmail.com') {
            return res.status(403).json({ error: 'Cannot delete the admin account' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- ROOMS MANAGEMENT ---

// Get all rooms (with owner info)
router.get('/rooms', async (req, res) => {
    try {
        const [rooms] = await pool.query(`
            SELECT r.*, u.name AS owner_name, u.email AS owner_email
            FROM rooms r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Update a room
router.put('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, location, price, description, contact, status } = req.body;

        await pool.query(
            'UPDATE rooms SET title=?, location=?, price=?, description=?, contact=?, status=? WHERE id=?',
            [title, location, price, description, contact, status, id]
        );

        res.status(200).json({ message: 'Room updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update room' });
    }
});

// Delete a room
router.delete('/rooms/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

module.exports = router;
