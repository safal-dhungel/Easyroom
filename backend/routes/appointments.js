// routes/appointments.js
// Handles: Book appointment, Get appointments (for buyer or seller), Update status

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// --- BOOK AN APPOINTMENT ---
// POST /api/appointments
// A buyer books a visit appointment for a room
router.post('/appointments', async (req, res) => {
    try {
        const { room_id, buyer_id, visit_date, visit_time, message } = req.body;

        if (!room_id || !buyer_id || !visit_date || !visit_time) {
            return res.status(400).json({ error: 'room_id, buyer_id, visit_date, and visit_time are required' });
        }

        // Get the room to find the seller
        const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
        if (rooms.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }

        const room = rooms[0];

        // Seller cannot book their own room
        if (room.user_id == buyer_id) {
            return res.status(400).json({ error: 'You cannot book an appointment for your own room' });
        }

        const seller_id = room.user_id;

        // Check if buyer already has a pending appointment for this room
        const [existing] = await pool.query(
            'SELECT * FROM appointments WHERE room_id = ? AND buyer_id = ? AND status = "pending"',
            [room_id, buyer_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You already have a pending appointment for this room' });
        }

        // Insert the appointment
        const [result] = await pool.query(
            'INSERT INTO appointments (room_id, buyer_id, seller_id, visit_date, visit_time, message) VALUES (?, ?, ?, ?, ?, ?)',
            [room_id, buyer_id, seller_id, visit_date, visit_time, message || null]
        );

        // Create a notification for the seller
        const [buyer] = await pool.query('SELECT name FROM users WHERE id = ?', [buyer_id]);
        const buyerName = buyer.length > 0 ? buyer[0].name : 'Someone';
        const notifMsg = `${buyerName} has requested a visit appointment for your room: "${room.title}" on ${visit_date} at ${visit_time}.`;

        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [seller_id, notifMsg]
        );

        res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// --- GET APPOINTMENTS FOR A USER ---
// GET /api/appointments?user_id=...&role=buyer|seller
// Returns appointments where the user is either a buyer or seller
router.get('/appointments', async (req, res) => {
    try {
        const { user_id, role } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        let query = '';
        let params = [];

        if (role === 'seller') {
            // Appointments where this user is the seller (their room was requested)
            query = `
                SELECT a.*, r.title AS room_title, r.location AS room_location,
                       u.name AS buyer_name, u.phone AS buyer_phone
                FROM appointments a
                JOIN rooms r ON a.room_id = r.id
                JOIN users u ON a.buyer_id = u.id
                WHERE a.seller_id = ?
                ORDER BY a.created_at DESC
            `;
            params = [user_id];
        } else {
            // Appointments where this user is the buyer (they requested a visit)
            query = `
                SELECT a.*, r.title AS room_title, r.location AS room_location,
                       u.name AS seller_name, u.phone AS seller_phone
                FROM appointments a
                JOIN rooms r ON a.room_id = r.id
                JOIN users u ON a.seller_id = u.id
                WHERE a.buyer_id = ?
                ORDER BY a.created_at DESC
            `;
            params = [user_id];
        }

        const [appointments] = await pool.query(query, params);
        res.status(200).json(appointments);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// --- UPDATE APPOINTMENT STATUS ---
// PATCH /api/appointments/:id/status
// Only the seller can accept or reject an appointment
router.patch('/appointments/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, user_id } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status must be "accepted" or "rejected"' });
        }

        // Make sure this appointment belongs to this seller
        const [existing] = await pool.query(
            'SELECT * FROM appointments WHERE id = ? AND seller_id = ?',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'Appointment not found or access denied' });
        }

        await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

        // Notify the buyer
        const appt = existing[0];
        const [room] = await pool.query('SELECT title FROM rooms WHERE id = ?', [appt.room_id]);
        const roomTitle = room.length > 0 ? room[0].title : 'the room';
        const notifMsg = `Your appointment request for "${roomTitle}" on ${appt.visit_date} has been ${status}.`;

        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [appt.buyer_id, notifMsg]
        );

        res.status(200).json({ message: `Appointment ${status} successfully` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update appointment status' });
    }
});

// --- CANCEL AN APPOINTMENT ---
// DELETE /api/appointments/:id
// Only the buyer can cancel their own pending appointment
router.delete('/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const [existing] = await pool.query(
            'SELECT * FROM appointments WHERE id = ? AND buyer_id = ? AND status = "pending"',
            [id, user_id]
        );

        if (existing.length === 0) {
            return res.status(403).json({ error: 'Appointment not found or cannot be cancelled' });
        }

        await pool.query('DELETE FROM appointments WHERE id = ?', [id]);
        res.status(200).json({ message: 'Appointment cancelled successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

module.exports = router;
