// frontend/js/main.js
// Shared utilities, authentication helpers, and dynamic navigation for EasyRoom

const API_BASE = '/api';

// --- AUTHENTICATION HELPERS ---
function getAuthUser() {
  const userJson = localStorage.getItem('easyroom_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem('easyroom_user');
    return null;
  }
}

function setAuthUser(user) {
  localStorage.setItem('easyroom_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('easyroom_user');
  window.location.href = 'login.html';
}

function requireAuth() {
  const user = getAuthUser();
  if (!user) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname.split('/').pop())}`;
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = getAuthUser();
  if (!user || !user.isAdmin) {
    alert('Access restricted to administrators.');
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

// --- ALERT MESSAGES ---
function showAlert(message, type = 'danger', containerId = 'alertContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearAlert(containerId = 'alertContainer') {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

// --- NAVBAR RENDERING ---
function renderNavbar(activePage = '') {
  const user = getAuthUser();
  const navContainer = document.getElementById('navbarContainer');
  if (!navContainer) return;

  let authNavItems = '';

  if (user) {
    authNavItems = `
      <li class="nav-item">
        <a class="nav-link ${activePage === 'my-rooms' ? 'active' : ''}" href="my-rooms.html">
          <i class="bi bi-collection me-1"></i> My Rooms
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${activePage === 'favorites' ? 'active' : ''}" href="favorites.html">
          <i class="bi bi-heart me-1"></i> Favorites
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link btn btn-outline-primary btn-sm ms-lg-2 px-3 ${activePage === 'add-room' ? 'active' : ''}" href="add-room.html">
          <i class="bi bi-plus-circle me-1"></i> Post Room
        </a>
      </li>
      <li class="nav-item dropdown ms-lg-2">
        <a class="nav-link dropdown-toggle text-dark fw-semibold" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle me-1 text-primary"></i> ${user.name || 'Account'}
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><a class="dropdown-item ${activePage === 'profile' ? 'active' : ''}" href="profile.html"><i class="bi bi-person me-2"></i> Profile</a></li>
          ${user.isAdmin ? `<li><a class="dropdown-item ${activePage === 'admin' ? 'active' : ''}" href="admin.html"><i class="bi bi-shield-lock me-2"></i> Admin Panel</a></li>` : ''}
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i> Logout</button></li>
        </ul>
      </li>
    `;
  } else {
    authNavItems = `
      <li class="nav-item">
        <a class="nav-link ${activePage === 'login' ? 'active' : ''}" href="login.html">
          <i class="bi bi-box-arrow-in-right me-1"></i> Login
        </a>
      </li>
      <li class="nav-item ms-lg-2">
        <a class="btn btn-primary btn-sm px-3" href="register.html">
          <i class="bi bi-person-plus me-1"></i> Register
        </a>
      </li>
    `;
  }

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center fs-4" href="index.html">
          <i class="bi bi-house-door-fill text-primary me-2"></i>
          <span>Easy<span class="text-dark">Room</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">
                <i class="bi bi-compass me-1"></i> Explore Rooms
              </a>
            </li>
          </ul>
          <ul class="navbar-nav align-items-lg-center">
            ${authNavItems}
          </ul>
        </div>
      </div>
    </nav>
  `;
}

// --- FOOTER RENDERING ---
function renderFooter() {
  const footerContainer = document.getElementById('footerContainer');
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer>
      <div class="container text-center">
        <p class="mb-1 fw-semibold text-dark">EasyRoom &copy; ${new Date().getFullYear()} - Find & Post Room Rentals Effortlessly</p>
        <small class="text-muted">Built with HTML5, Bootstrap 5, Express & MySQL</small>
      </div>
    </footer>
  `;
}

// Format Price
function formatPrice(price) {
  return 'Rs. ' + Number(price).toLocaleString('en-IN');
}

// Extract images helper (handles JSON string array or raw array)
function parseImages(imagesData) {
  if (!imagesData) return [];
  if (Array.isArray(imagesData)) return imagesData;
  try {
    const parsed = JSON.parse(imagesData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
