// db/connection.js
// This file creates a connection pool to our MySQL database.
// A "pool" means Node.js keeps a few connections open and reuses them,
// instead of opening a new connection for every request.

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',       // Database server address
    user: 'root',           // MySQL username
    password: '',           // MySQL password (empty for XAMPP default)
    database: 'easyroom',   // The database name we created
    connectionLimit: 10     // Maximum 10 simultaneous connections
});

module.exports = pool;
