// src/components/layout/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>BeHealthy</h2>
      <ul style={styles.menu}>
        <li onClick={() => navigate('/home')} style={styles.item}>🏠 Home</li>
        <li onClick={() => navigate('/profile')} style={styles.item}>👤 Profile</li>
        <li onClick={() => navigate('/MealScanner')} style={styles.item}>📷 Meal Scanner</li>
        <li onClick={() => navigate('/recipes')} style={styles.item}>🍳 Recipes</li>
        <li onClick={() => navigate('/knowledge')} style={styles.item}>📚 Knowledge Center</li>
      </ul>
    </div>
  );
};

const styles = {
  sidebar: { width: '250px', height: '100vh', backgroundColor: '#343a40', color: '#fff', padding: '20px' },
  logo: { textAlign: 'center', marginBottom: '40px' },
  menu: { listStyle: 'none', padding: 0 },
  item: { padding: '15px', cursor: 'pointer', borderBottom: '1px solid #495057', fontSize: '18px' }
};

export default Sidebar;