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

-- Insert Admin User (email: admin@gmail.com, password: 12345678)
INSERT IGNORE INTO users (name, email, phone, password)
VALUES ('Admin', 'admin@gmail.com', '0000000000', '$2b$10$eXM5d785qm8qIe6BujlMiOG0IyzbxMx0xJm5r.24jW9LJjlQfioQ.');


