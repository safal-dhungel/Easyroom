-- Database Creation
CREATE DATABASE IF NOT EXISTS easyroom;
USE easyroom;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(10),
    password VARCHAR(255) NOT NULL
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    contact VARCHAR(10) NOT NULL,
    images LONGTEXT,
    status ENUM('available', 'rented') DEFAULT 'available',
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    room_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, room_id)
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Seed initial admin user (username: admin, password: pass123)
INSERT IGNORE INTO admins (username, password) VALUES ('admin', '$2b$10$TOXEfJuuXtt6c7UIcYkJweevarJ9Z2X57y2SlaJlpXVr6yeK.apQ6');
