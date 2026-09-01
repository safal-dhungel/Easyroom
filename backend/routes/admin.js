// routes/admin.js
// Handles: Admin-only routes for managing all users and rooms

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// ==================
// USER MANAGEMENT
// ==================

// --- GET ALL USERS ---
// GET /api/admin/users
// Returns a list of all registered users
router.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, phone FROM users ORDER BY id DESC'
        );
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// --- DELETE A USER ---
// DELETE /api/admin/users/:id
// Deletes a user (but blocks deletion of the admin account)
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

// ==================
// ROOM MANAGEMENT
// ==================

// --- GET ALL ROOMS ---
// GET /api/admin/rooms
// Returns all rooms with the owner's name
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

// --- DELETE A ROOM ---
// DELETE /api/admin/rooms/:id
// Admin can delete any room
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
