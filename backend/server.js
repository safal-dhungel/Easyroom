// server.js
// This is the main entry point for our backend.
// It sets up Express, connects all the route files, and starts listening.

const express = require('express');
const cors = require('cors');

// Import route files — each file handles a specific set of endpoints
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());            // Allow requests from the frontend (different port)
app.use(express.json());    // Parse incoming JSON request bodies

// Routes
// All user routes are at /api/...       e.g. POST /api/login
// All admin routes are at /api/admin/... e.g. GET /api/admin/users
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// Health check — just to confirm the server is running
app.get('/', (req, res) => {
    res.send('EasyRoom API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
