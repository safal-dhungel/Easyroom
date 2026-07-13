# EasyRoom - Room/Hostel Finder System

EasyRoom is a simple web application designed for a BCA academic project where users can register, post room listings, browse available rooms, and view contact details.

## 🧱 Tech Stack
- **Frontend**: React (Vite), React Router, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL (via XAMPP)

---

## 🚀 Complete Setup Instructions

### 1. Install Required Software
#### Install Node.js
1. Go to the [Node.js Official Website](https://nodejs.org/).
2. Download the LTS (Long Term Support) version for your operating system.
3. Run the installer and follow the prompt. Keep default settings.
4. Verify installation by opening a terminal and running:
   ```bash
   node -v
   npm -v
   ```

#### Install XAMPP
1. Go to the [XAMPP Official Website](https://www.apachefriends.org/index.html).
2. Download the version for your OS.
3. Run the installer. Ensure **MySQL** is selected during installation.
4. After installation, open the **XAMPP Control Panel** and click **Start** next to **Apache** and **MySQL**.

---

### 2. Set Up the Database
1. Open your browser and go to `http://localhost/phpmyadmin/`.
2. Click on the **SQL** tab at the top.
3. Copy the following SQL code, paste it into the query box, and click **Go**:

```sql
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
```
*Note: If you encounter issues, ensure your XAMPP MySQL server is running on the default port (3306) with user `root` and an empty password.*

---

### 3. Run the Backend Server
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Node modules:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   *You should see a message: "Server is running on http://localhost:5000"*

---

### 4. Run the Frontend App
1. Open a **new** terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the required Node modules:
   ```bash
   npm install
   ```
3. Start the development server using Vite:
   ```bash
   npm run dev
   ```
   *You will see a Local URL (usually http://localhost:5173). Open that link in your browser.*

---

## 🎨 Features Implemented
- **Authentication**: Registration and login with local session storage (React Context).
  - Password show/hide toggle on Login and Register forms.
  - Minimum password length enforced (8 characters).
- **Phone Number Validation**: Accepts only numeric input, limited to exactly 10 digits (on registration, profile, and room contact fields).
- **User Profile (`/me`)**: Users can view and update their Full Name, Email, and Phone Number.
- **Add Room**: Users can post rooms with title, price, description, contact, and optional images (up to 5 image URLs).
- **My Rooms**:
  - View all rooms posted by the logged-in user.
  - Edit any room's details (title, location, price, description, contact, images) via a modal.
  - Toggle room status between **Available** and **Rented**.
  - "Add New Room" button accessible from this page.
- **View Rooms**: A clean, responsive card layout showing all available rooms with status badges.
- **Room Details**: Detailed view with image gallery (thumbnails) and status badge.
- **Search**: Text-based filtering by location on the homepage.
- **Admin Panel**: Secure dashboard accessible via `/admin/login` (Username: `admin`, Password: `pass123`). Admin can view, edit, and delete any users and rooms. Public sign-up/login for admin is strictly disabled.
- **Modern UI**: Clean design system with dynamic hovers, shadows, modals, animations, and intuitive layout built strictly with Vanilla CSS.
