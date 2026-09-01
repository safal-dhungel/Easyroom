import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRoom from './pages/AddRoom';
import RoomDetails from './pages/RoomDetails';
import MyRooms from './pages/MyRooms';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import { checkServerConnection } from './services/api';
import './index.css';

function App() {
  const [serverConnected, setServerConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyConnection = async () => {
      try {
        await checkServerConnection();
        setServerConnected(true);
      } catch (error) {
        setServerConnected(false);
      } finally {
        setIsChecking(false);
      }
    };
    verifyConnection();
  }, []);

  if (isChecking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: 'gray' }}>
        Checking connection...
      </div>
    );
  }

  if (!serverConnected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem', color: 'red', fontWeight: 'bold' }}>
        Server not connected
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/add-room" element={<ProtectedRoute><AddRoom /></ProtectedRoute>} />
              <Route path="/room/:id" element={<RoomDetails />} />
              <Route path="/my-rooms" element={<ProtectedRoute><MyRooms /></ProtectedRoute>} />
              <Route path="/me" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
