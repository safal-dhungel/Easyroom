# EasyRoom - Room/Hostel Finder System

EasyRoom is a clean, simple web application built for finding and posting room/apartment rentals.

## 🧱 Tech Stack
- **Frontend**: HTML5, Bootstrap 5.3, Bootstrap Icons, Vanilla JavaScript
- **Backend**: Node.js, Express.js (serves API & static frontend)
- **Database**: MySQL (via XAMPP)

---

## 🚀 Quick Setup Instructions

### 1. Set Up Database (XAMPP)
1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open your browser and go to `http://localhost/phpmyadmin/`.
3. Click the **SQL** tab, paste the contents of `database.sql`, and click **Go**.

---

### 2. Start the Application
1. Open terminal and go into the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *(or `node server.js`)*

4. Open your browser and visit:
   **`http://localhost:5000`**

*That's it! The Express backend directly serves all frontend HTML pages and API endpoints together on port 5000.*

---

## 📄 Pages Included
- **`index.html`** (Home / Explore Rooms with location and price filters, favorite bookmarks)
- **`room-details.html`** (Room details, photo carousel, owner information, direct call button)
- **`login.html`** (User and Admin login)
- **`register.html`** (User registration with phone & password validation)
- **`add-room.html`** (Post new room with up to 5 image uploads & previews)
- **`my-rooms.html`** (Manage your listings: edit details, toggle available/rented status, delete)
- **`favorites.html`** (View and manage saved favorite rooms)
- **`profile.html`** (View and update name, email, and phone number)
- **`admin.html`** (Admin dashboard for managing all users and room listings)

---

## 🔑 Admin Credentials
- **Email**: `admin@gmail.com`
- **Password**: `12345678`

