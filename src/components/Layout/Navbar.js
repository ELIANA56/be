// src/components/layout/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.title}>Mon Tableau de Bord</div>
      <button onClick={handleLogout} style={styles.logoutBtn}>Déconnexion</button>
    </nav>
  );
};

const styles = {
  navbar: { height: '60px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #dee2e6' },
  title: { fontSize: '20px', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default Navbar;


