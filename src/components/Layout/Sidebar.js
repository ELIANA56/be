/**
 * SIDEBAR — Left menu with links to Home, Workout, Recipes, Profile.
 * Highlights the page you are currently on.
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/workout', label: 'Workout', icon: '💪' },
  { path: '/recipes', label: 'Recipes', icon: '🍳' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logoMark}>B</div>
        <div>
          <p style={styles.brandName}>BeHealthy</p>
          <p style={styles.brandTag}>Your wellness hub</p>
        </div>
      </div>

      <nav style={styles.nav}>
        <p style={styles.navLabel}>Menu</p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#fff',
    borderRight: '1px solid #e0e0e0',
    padding: '24px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 8px 16px',
    borderBottom: '1px solid #e9ecef',
  },
  logoMark: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
  },
  brandName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#212529',
  },
  brandTag: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#6c757d',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  navLabel: {
    margin: '0 0 8px 8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '12px 14px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: 'transparent',
    color: '#495057',
    fontSize: '15px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, color 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#e8f4fd',
    color: '#007bff',
    fontWeight: '600',
  },
  icon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center',
  },
};

export default Sidebar;
