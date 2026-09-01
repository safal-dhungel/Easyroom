// routes/users.js
// Handles: Register, Login, Get Profile, Update Profile

const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const bcrypt = require('bcrypt');

// --- REGISTER ---
// POST /api/register
// Creates a new user account
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validate password length
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Validate phone: numbers only, exactly 10 digits
        if (!phone || !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
        }

        // Hash the password before saving (never store plain-text passwords)
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
            [name, email, phone, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

    } catch (error) {
        console.error(error);
        // If the email already exists in the database
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// --- LOGIN ---
// POST /api/login
// Checks credentials and returns user data if correct
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Special hardcoded check for the admin account
        if (email === 'admin@gmail.com' && password === '12345678') {
            return res.status(200).json({
                message: 'Admin login successful',
                user: { id: 0, name: 'Admin', email: 'admin@gmail.com', isAdmin: true }
            });
        }

        // Look up the user by email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Compare the entered password with the hashed one in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user data (never return the password)
        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// --- GET PROFILE ---
// GET /api/me/:id
// Returns profile data for a specific user
router.get('/me/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await pool.query(
            'SELECT id, name, email, phone FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(users[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// --- UPDATE PROFILE ---
// PUT /api/me/:id
// Updates a user's name, email, and phone
router.put('/me/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone } = req.body;

        // Validate phone if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
        }

        await pool.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone || null, id]
        );

        // Return the updated user data
        const [users] = await pool.query(
            'SELECT id, name, email, phone FROM users WHERE id = ?',
            [id]
        );

        res.status(200).json({ message: 'Profile updated successfully', user: users[0] });

    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = router;
