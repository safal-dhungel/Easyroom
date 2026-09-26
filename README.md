# EasyRoom 🏠

A simple room rental web application built with **HTML, Bootstrap 5, Express.js, and MySQL**. EasyRoom allows users to post, browse, and find rental rooms easily.

---

## Features

### For Buyers (Renters)
- 🔍 Browse and search available rooms by location and max price
- ❤️ Save rooms to favorites for quick access later
- 📅 **Request a visit appointment** for any room listing
- ⭐ Leave a star rating and review for rooms
- 🔔 Receive in-app notifications when appointments are accepted/rejected

### For Sellers (Room Owners)
- ➕ Post room listings with up to 5 photos
- ✏️ Edit and delete your own listings
- 🔄 Toggle room status between **Available** and **Rented**
- 📬 Receive appointment requests from buyers
- ✅ Accept or ❌ Reject visit appointments
- 👁️ See how many times your room listing has been viewed

### General
- 👤 User registration and login (with bcrypt-hashed passwords)
- 🧑‍💼 Admin panel to manage all users and rooms
- 📱 Responsive design (works on mobile, tablet, and desktop)

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML5, Bootstrap 5, Vanilla JS    |
| Backend  | Node.js, Express.js               |
| Database | MySQL (via XAMPP)                 |
| Auth     | bcrypt password hashing           |
| Fonts    | Plus Jakarta Sans (Google Fonts)  |
| Icons    | Bootstrap Icons                   |

---

## Database Tables

| Table          | Purpose                                                       |
|----------------|---------------------------------------------------------------|
| `users`        | Stores registered user accounts                               |
| `rooms`        | Stores room listings posted by users                          |
| `favorites`    | Tracks which rooms each user has saved to favorites           |
| `appointments` | Stores visit requests from buyers to sellers                  |
| `reviews`      | Stores star ratings and comments left on room listings        |
| `room_views`   | Tracks how many times each room listing has been viewed       |
| `notifications`| In-app notifications for appointment updates                  |

---

## Project Structure

```
EasyRoom/
├── backend/
│   ├── db/
│   │   └── connection.js       # MySQL connection pool
│   ├── routes/
│   │   ├── users.js            # Register, Login, Profile
│   │   ├── rooms.js            # CRUD for rooms + view tracking
│   │   ├── favorites.js        # Save / unsave rooms
│   │   ├── appointments.js     # Book, list, accept/reject appointments
│   │   ├── reviews.js          # Add, list, delete reviews
│   │   ├── notifications.js    # In-app notification system
│   │   └── admin.js            # Admin-only user & room management
│   ├── package.json
│   └── server.js               # Express app entry point
│
├── frontend/
│   ├── js/
│   │   └── main.js             # Shared auth helpers, navbar, utilities
│   ├── index.html              # Browse all rooms (home page)
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── room-details.html       # Room detail view + appointment + reviews
│   ├── add-room.html           # Post a new room listing
│   ├── my-rooms.html           # Manage your own listings
│   ├── favorites.html          # Saved favorite rooms
│   ├── appointments.html       # View and manage appointments
│   ├── profile.html            # Edit user profile
│   └── admin.html              # Admin panel
│
├── database.sql                # Full database schema (run this first)
└── README.md
```

---

## Getting Started

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (for MySQL)
- [Node.js](https://nodejs.org/) (v18 or later)

### Setup

1. **Clone or download** this repository.

2. **Start XAMPP** and make sure MySQL is running.

3. **Create the database** — open phpMyAdmin or use the MySQL CLI and run:
   ```sql
   source database.sql
   ```
   This creates all tables and the default admin account.

4. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

5. **Start the backend server:**
   ```bash
   node server.js
   ```

6. **Open your browser** and go to: [http://localhost:5000](http://localhost:5000)

---

## Default Admin Account

| Field    | Value             |
|----------|-------------------|
| Email    | admin@gmail.com   |
| Password | 12345678          |

> ⚠️ Change this password in production!

---

## API Endpoints

### Users
| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| POST   | /api/register   | Register new user      |
| POST   | /api/login      | Login                  |
| GET    | /api/me/:id     | Get user profile       |
| PUT    | /api/me/:id     | Update user profile    |

### Rooms
| Method | Endpoint                  | Description                     |
|--------|---------------------------|---------------------------------|
| GET    | /api/rooms                | Get all rooms (with filters)    |
| GET    | /api/rooms/:id            | Get single room (tracks view)   |
| GET    | /api/rooms/:id/views      | Get room view count             |
| POST   | /api/rooms                | Add a new room                  |
| PUT    | /api/rooms/:id            | Update a room                   |
| PATCH  | /api/rooms/:id/status     | Toggle available/rented         |
| DELETE | /api/rooms/:id            | Delete a room                   |
| GET    | /api/my-rooms             | Get rooms by a user             |

### Favorites
| Method | Endpoint                   | Description                 |
|--------|----------------------------|-----------------------------|
| POST   | /api/favorites/toggle      | Save or unsave a room       |
| GET    | /api/favorites/:user_id    | Get all favorites for user  |

### Appointments
| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| POST   | /api/appointments                 | Book a visit appointment       |
| GET    | /api/appointments?user_id&role    | Get appointments by role       |
| PATCH  | /api/appointments/:id/status      | Accept or reject (seller only) |
| DELETE | /api/appointments/:id             | Cancel appointment (buyer only)|

### Reviews
| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /api/reviews/:room_id | Get reviews for a room       |
| POST   | /api/reviews          | Add a review                 |
| DELETE | /api/reviews/:id      | Delete own review            |

### Notifications
| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | /api/notifications/:user_id           | Get all notifications        |
| PATCH  | /api/notifications/:id/read           | Mark one as read             |
| PATCH  | /api/notifications/read-all/:user_id  | Mark all as read             |

### Admin
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| GET    | /api/admin/users        | Get all users            |
| DELETE | /api/admin/users/:id    | Delete a user            |
| GET    | /api/admin/rooms        | Get all rooms            |
| DELETE | /api/admin/rooms/:id    | Delete any room          |

---

## Built By

This is a school project demonstrating a full-stack web application using beginner-friendly technologies: plain HTML/CSS/JS on the frontend and Express + MySQL on the backend — no frontend frameworks needed.
