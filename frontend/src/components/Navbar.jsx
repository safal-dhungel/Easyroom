import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <h1>EasyRoom</h1>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {user ? (
          <>
            {user.isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/me" className="nav-link">Me</Link>
                <Link to="/favorites" className="nav-link">Favorites</Link>
                <Link to="/my-rooms" className="nav-link">My Rooms</Link>
              </>
            )}
            <button onClick={handleLogout} className="btn btn-danger">
              Logout ({user.name})
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

