// routes/notifications.js
// Handles: Get notifications for a user, Mark as read, Mark all as read

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// --- GET NOTIFICATIONS ---
// GET /api/notifications/:user_id
// Returns all notifications for a user (newest first)
router.get('/notifications/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        const [notifications] = await pool.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [user_id]
        );

        const unreadCount = notifications.filter(n => !n.is_read).length;

        res.status(200).json({ notifications, unreadCount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// --- MARK A NOTIFICATION AS READ ---
// PATCH /api/notifications/:id/read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [id, user_id]
        );

        res.status(200).json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// --- MARK ALL NOTIFICATIONS AS READ ---
// PATCH /api/notifications/read-all/:user_id
router.patch('/notifications/read-all/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
            [user_id]
        );

        res.status(200).json({ message: 'All notifications marked as read' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
