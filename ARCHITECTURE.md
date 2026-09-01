# EasyRoom — Architecture & Project Guide

A clear, beginner-friendly guide explaining how EasyRoom is structured, how the frontend and backend communicate, and how the database is organized.

---

## 🗂️ Project Directory Structure

```
EasyRoom/
├── backend/                  ← Node.js & Express server (API + Static File Server)
│   ├── server.js             ← Main entry point, serves HTML pages & API routes
│   ├── package.json          ← Backend dependencies & scripts
│   ├── db/
│   │   └── connection.js     ← MySQL database connection pool (XAMPP)
│   └── routes/
│       ├── users.js          ← User registration, login, and profile
│       ├── rooms.js          ← Room listings (browse, add, edit, delete, status toggle)
│       ├── favorites.js      ← Save/unsave favorite rooms
│       └── admin.js          ← Admin controls: manage all users and rooms
│
├── frontend/                 ← HTML5, Bootstrap 5, & Vanilla JavaScript
│   ├── index.html            ← Homepage: search & explore available rooms
│   ├── room-details.html     ← Detailed room view: image carousel & owner contact
│   ├── login.html            ← User & admin sign in
│   ├── register.html         ← New user account registration
│   ├── add-room.html         ← Post a new room with image uploads
│   ├── my-rooms.html         ← User's dashboard: manage listings & edit modal
│   ├── favorites.html        ← User's saved favorite rooms
│   ├── profile.html          ← View and edit user profile
│   ├── admin.html            ← Admin dashboard: user & room oversight
│   ├── css/
│   │   └── style.css         ← Clean custom styles & theme overrides
│   └── js/
│       └── main.js           ← Shared navbar, auth helpers, & API utilities
│
├── database.sql              ← Database schema & initial admin account
└── README.md                 ← Step-by-step setup instructions
```

---

## 🏗️ 3-Tier Architecture Overview

EasyRoom follows a standard **3-Tier Architecture**:

| Tier | Component | Technology | Responsibility |
| :--- | :--- | :--- | :--- |
| **Presentation Tier** | Frontend | HTML5, Bootstrap 5, Vanilla JS | Displays pages, handles user interactions, and sends HTTP requests. |
| **Application Tier** | Backend Server | Node.js + Express.js | Serves static HTML pages, processes business logic, and exposes REST API. |
| **Data Tier** | Database | MySQL (via XAMPP) | Persistently stores users, room listings, and favorites. |

```
[ Web Browser ]
 (HTML5 + Bootstrap 5 + JS)
       │
       │  HTTP Requests (fetch GET/POST/PUT/DELETE)
       ▼
[ Express.js Server ] ── (Port 5000)
       │
       │  SQL Queries (mysql2/promise)
       ▼
[ MySQL Database ] ──── (easyroom database on XAMPP)
```

---

## 🔄 How Data Flows (Simple Example: User Login)

```
Browser (login.html)             Backend (server.js)            MySQL (easyroom)
        │                                │                              │
   User submits form                     │                              │
        │                                │                              │
        │  POST /api/login               │                              │
        │  { email, password }           │                              │
        ├───────────────────────────────>│                              │
        │                                │  SELECT * FROM users         │
        │                                │  WHERE email = ?             │
        │                                ├─────────────────────────────>│
        │                                │                              │
        │                                │  ◄── Returns user row ───────┤
        │                                │                              │
        │                                │  Compares password with      │
        │                                │  bcrypt.compare()            │
        │                                │                              │
        │  ◄── Returns JSON User Data ───┤                              │
        │                                │                              │
   Saves user to localStorage            │                              │
   Redirects to index.html               │                              │
```

---

## 🔐 How Authentication & Sessions Work

EasyRoom uses **Client-Side Storage (`localStorage`)** for session management:

1. When a user logs in via `login.html`, the backend verifies the hashed password using **bcrypt**.
2. On successful login, user details (`id`, `name`, `email`, `phone`) are returned to the browser.
3. The browser stores this object in `localStorage.setItem('easyroom_user', ...)`.
4. Across all HTML pages, `js/main.js` automatically checks `localStorage` to:
   - Display the logged-in user's name in the navigation bar.
   - Show links to **My Rooms**, **Post Room**, **Favorites**, and **Profile**.
   - Show the **Admin Panel** link if the logged-in user is the admin.
5. Clicking **Logout** clears `localStorage` and redirects the user to `login.html`.

---

## 🗄️ Database Schema & Relationships

The database (`easyroom`) contains 3 tables:

### 1. `users` Table
Stores registered accounts.
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `phone` (VARCHAR(10))
- `password` (VARCHAR, Bcrypt Hash)

### 2. `rooms` Table
Stores room listings posted by users.
- `id` (INT, Primary Key, Auto Increment)
- `title` (VARCHAR)
- `location` (VARCHAR)
- `price` (INT) — monthly rent in Rs.
- `description` (TEXT)
- `contact` (VARCHAR(10))
- `images` (LONGTEXT) — JSON array of image strings
- `status` (ENUM: 'available', 'rented')
- `user_id` (INT, Foreign Key referencing `users.id` with `ON DELETE CASCADE`)
- `created_at` (TIMESTAMP)

### 3. `favorites` Table
Stores rooms saved by users.
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key referencing `users.id` with `ON DELETE CASCADE`)
- `room_id` (INT, Foreign Key referencing `rooms.id` with `ON DELETE CASCADE`)
- `UNIQUE KEY (user_id, room_id)` — prevents duplicate saves

---

## 🌐 REST API Endpoints Summary

### User Endpoints (`/api`)
- `POST /api/register` — Create a new user account
- `POST /api/login` — Sign in and verify credentials
- `GET /api/me/:id` — Get profile data for a user
- `PUT /api/me/:id` — Update profile data (name, email, phone)

### Room Endpoints (`/api`)
- `GET /api/rooms` — Get all rooms (supports `?location=` and `?maxPrice=` filters)
- `GET /api/rooms/:id` — Get full details for a single room
- `GET /api/my-rooms?user_id=` — Get all rooms posted by a specific user
- `POST /api/rooms` — Create a new room listing
- `PUT /api/rooms/:id` — Edit an existing room listing
- `PATCH /api/rooms/:id/status` — Toggle room status between "available" and "rented"
- `DELETE /api/rooms/:id` — Delete a room listing

### Favorite Endpoints (`/api`)
- `POST /api/favorites/toggle` — Save or unsave a room bookmark
- `GET /api/favorites/:user_id` — Get all rooms saved by a user

### Admin Endpoints (`/api/admin`)
- `GET /api/admin/users` — List all registered users
- `DELETE /api/admin/users/:id` — Delete a user account (admin protected)
- `GET /api/admin/rooms` — List all rooms with owner info
- `DELETE /api/admin/rooms/:id` — Delete any room listing

---

## 💡 Key Terms Explained for Beginners

- **HTML5**: Defines the structure of the web pages.
- **Bootstrap 5**: CSS framework that provides responsive grid layouts, buttons, cards, modals, and forms without writing complex CSS.
- **Vanilla JavaScript**: Standard JavaScript without external frameworks, used to fetch data and dynamically update HTML elements.
- **Express Static**: Middleware in Express (`app.use(express.static(...))`) that allows the server to serve HTML, CSS, and JS files directly to the browser.
- **Bcrypt**: A password hashing algorithm that securely scrambles passwords before saving them in the database.
- **Foreign Key (`ON DELETE CASCADE`)**: Ensures relational integrity; when a user is deleted, all their posted rooms and favorites are automatically removed.
