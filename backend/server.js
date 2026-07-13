const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('EasyRoom API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
