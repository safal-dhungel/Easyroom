const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcrypt');

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [admins] = await pool.query(
            'SELECT * FROM admins WHERE username = ?',
            [username]
        );
        
        if (admins.length > 0) {
            const admin = admins[0];
            const isMatch = await bcrypt.compare(password, admin.password);
            if (isMatch) {
                // In a real app, you would issue a JWT token here
                res.status(200).json({
                    message: 'Admin login successful',
                    admin: { id: admin.id, username: admin.username }
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

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
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- ROOMS MANAGEMENT ---

// Get all rooms
router.get('/rooms', async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM rooms ORDER BY created_at DESC');
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
