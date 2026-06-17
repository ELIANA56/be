import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/home': 'Dashboard',
  '/workout': 'Workout',
  '/recipes': 'Recipes',
  '/profile': 'Profile',
  '/knowledge': 'Knowledge Center',
};

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'BeHealthy';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header style={styles.navbar}>
      <h1 style={styles.title}>{title}</h1>
      <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
        Log out
      </button>
    </header>
  );
};

const styles = {
  navbar: {
    height: '64px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#212529',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    color: '#dc3545',
    border: '1px solid #f1aeb5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default Navbar;
