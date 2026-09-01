# EasyRoom — Architecture & How It Works

A simple guide explaining how the app is built, how data flows, and what the database looks like.

---

## 🗂️ Project Structure

```
EasyRoom/
├── backend/         ← Node.js server (handles data, talks to database)
│   ├── server.js        ← Main entry point, starts the server
│   ├── db/
│   │   └── connection.js  ← Database connection setup
│   └── routes/
│       ├── users.js       ← Register, Login, Profile
│       ├── rooms.js       ← List, Add, Edit, Delete rooms
│       ├── favorites.js   ← Save/unsave rooms
│       └── admin.js       ← Admin-only: manage all users & rooms
│
├── frontend/        ← React app (what the user sees in the browser)
│   └── src/
│       ├── App.jsx            ← Root component, sets up all routes
│       ├── index.css          ← All styles for the app
│       ├── context/
│       │   └── AuthContext.jsx  ← Global login state (who is logged in)
│       ├── services/
│       │   └── api.js           ← Functions that call the backend API
│       ├── components/
│       │   ├── Navbar.jsx             ← Top navigation bar
│       │   ├── RoomCard.jsx           ← Card shown on home/favorites pages
│       │   ├── ProtectedRoute.jsx     ← Blocks pages if not logged in
│       │   └── AdminProtectedRoute.jsx ← Blocks admin pages if not admin
│       └── pages/
│           ├── Home.jsx         ← Browse all rooms
│           ├── Login.jsx        ← Login form
│           ├── Register.jsx     ← Sign up form
│           ├── AddRoom.jsx      ← Post a new room
│           ├── MyRooms.jsx      ← View/edit/delete your own rooms
│           ├── RoomDetails.jsx  ← Full details of one room
│           ├── Profile.jsx      ← View/edit your profile
│           ├── Favorites.jsx    ← Rooms you saved
│           ├── NotFound.jsx     ← 404 page
│           └── admin/
│               └── AdminDashboard.jsx  ← Admin panel
│
├── database.sql     ← SQL to set up the database tables
└── README.md        ← Setup instructions
```

---

## 🔄 How Data Flows (Simple Example)

**Example: User logs in**

```
Browser (React)          Backend (Node.js)           Database (MySQL)
     │                         │                           │
     │  POST /api/login        │                           │
     │  { email, password }    │                           │
     │ ─────────────────────► │                           │
     │                         │  SELECT * FROM users      │
     │                         │  WHERE email = ?          │
     │                         │ ────────────────────────► │
     │                         │                           │
     │                         │  ◄──── Returns user row ──│
     │                         │                           │
     │                         │  Checks password with     │
     │                         │  bcrypt.compare()         │
     │                         │                           │
     │  ◄─────────────────── { user: { id, name, email } } │
     │                         │                           │
     │  Saves to localStorage   │                           │
     │  Navigates to home       │                           │
```

---

## 🏗️ Architecture — 3 Layers

The app follows a simple **3-layer architecture**:

| Layer | What it does | Technology |
|-------|-------------|------------|
| **Frontend** | Shows pages, handles user clicks | React (Vite) |
| **Backend** | Handles requests, validates data, talks to DB | Node.js + Express |
| **Database** | Stores all data permanently | MySQL (via XAMPP) |

These layers communicate like this:

```
User clicks button
       ↓
React makes HTTP request  (e.g. GET /api/rooms)
       ↓
Express receives request, queries the database
       ↓
MySQL returns data
       ↓
Express sends JSON response back to React
       ↓
React updates the screen
```

---

## 🔐 Authentication (How Login Works)

EasyRoom uses **localStorage** to keep users logged in — no sessions or cookies.

1. User fills in email + password → React sends it to `POST /api/login`
2. Backend finds the user in the database, checks the password with **bcrypt**
3. If correct, backend sends back user info `{ id, name, email }`
4. React saves this to **localStorage** and to **AuthContext** (global state)
5. The Navbar reads AuthContext to decide what links to show
6. When user logs out, localStorage is cleared and context is reset

**Admin user** is a special case — checked with a hardcoded `if` in the backend:
```js
if (email === 'admin@gmail.com' && password === '12345678') {
    // return admin user object with isAdmin: true
}
```
The admin gets `isAdmin: true` in their user object, which unlocks the dashboard.

---

## 🗄️ Database Schema

The database has 3 tables. Here's what each one stores:

### `users` table
Stores everyone who has registered (including the admin).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (auto) | Unique ID for each user |
| `name` | VARCHAR | Full name |
| `email` | VARCHAR (unique) | Email address used to log in |
| `phone` | VARCHAR | 10-digit phone number |
| `password` | VARCHAR | Bcrypt-hashed password (never stored as plain text) |

### `rooms` table
Stores all room listings posted by users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (auto) | Unique ID for each room |
| `title` | VARCHAR | Room title |
| `location` | VARCHAR | Where the room is located |
| `price` | INT | Monthly rent in Rs. |
| `description` | TEXT | Full description of the room |
| `contact` | VARCHAR | Contact phone number |
| `images` | LONGTEXT | JSON string of image data (e.g. `["base64...","base64..."]`) |
| `status` | ENUM | Either `available` or `rented` |
| `user_id` | INT | Links to the user who posted it (foreign key) |
| `created_at` | TIMESTAMP | When the room was posted |

### `favorites` table
Stores which rooms each user has saved.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (auto) | Unique ID |
| `user_id` | INT | Which user saved the room |
| `room_id` | INT | Which room was saved |

> A **foreign key** means the value must match an existing row in another table.
> For example, `user_id` in `rooms` must be a valid `id` from the `users` table.
> If the user is deleted, their rooms are automatically deleted too (`ON DELETE CASCADE`).

### Relationship Diagram

```
users ──────────< rooms        (one user can post many rooms)
users ──────────< favorites    (one user can save many rooms)
rooms ──────────< favorites    (one room can be saved by many users)
```

---

## 🌐 API Endpoints

All endpoints start with `http://localhost:5000`.

### User Routes (`/api`)
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/register` | Create a new user account |
| POST | `/api/login` | Log in and get user data |
| GET | `/api/me/:id` | Get a user's profile |
| PUT | `/api/me/:id` | Update a user's profile |

### Room Routes (`/api`)
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/rooms` | Get all rooms (with optional `?location=` and `?maxPrice=` filters) |
| GET | `/api/rooms/:id` | Get one room's full details |
| GET | `/api/my-rooms?user_id=` | Get rooms posted by a specific user |
| POST | `/api/rooms` | Add a new room listing |
| PUT | `/api/rooms/:id` | Edit a room (owner only) |
| PATCH | `/api/rooms/:id/status` | Toggle available/rented (owner only) |
| DELETE | `/api/rooms/:id` | Delete a room (owner only) |

### Favorite Routes (`/api`)
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/favorites/toggle` | Save or unsave a room |
| GET | `/api/favorites/:user_id` | Get all rooms saved by a user |

### Admin Routes (`/api/admin`)
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/admin/users` | Get all users |
| DELETE | `/api/admin/users/:id` | Delete a user |
| GET | `/api/admin/rooms` | Get all rooms (with owner info) |
| DELETE | `/api/admin/rooms/:id` | Delete any room |

---

## 📦 Key Technologies Explained

| Technology | What it is | Why we use it |
|------------|-----------|--------------|
| **React** | JavaScript UI library | Build interactive pages without reloading |
| **Vite** | Development tool | Fast dev server for React |
| **React Router** | Navigation library | Handle multiple pages in a single-page app |
| **React Context** | Built-in React feature | Share login state across all components |
| **Node.js** | JavaScript runtime | Run JavaScript on the server |
| **Express** | Web framework for Node | Easily define routes and handle requests |
| **MySQL** | Database | Store data permanently in tables |
| **mysql2** | Node.js library | Connect and query MySQL from Node |
| **bcrypt** | Password hashing library | Securely hash passwords before storing |
| **cors** | Express middleware | Allow the frontend (port 5173) to call the backend (port 5000) |

---

## 💡 Key Concepts for Beginners

**What is a REST API?**
The backend exposes "endpoints" — URLs that do specific things. The frontend calls these URLs using `fetch()`. The backend responds with JSON data.

**What is bcrypt?**
A way to scramble passwords so even if someone sees the database, they can't read the passwords. When logging in, bcrypt compares the scrambled version without ever un-scrambling it.

**What is localStorage?**
A place in the browser where you can save small amounts of data (like a logged-in user's info) that persists even after the page is refreshed.

**What is React Context?**
A way to share data (like who is logged in) with any component in the app, without having to pass it as props through every parent component.

**What is a Foreign Key?**
A column in one table that references a row in another table. For example, `rooms.user_id` points to `users.id`. This ensures every room belongs to a real user.
