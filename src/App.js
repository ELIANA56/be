import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/dashboard/Home';
import Profile from './components/auth/Profile';
import MealScanner from './components/dashboard/MealScanner'; // 1. IMPORT
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages SANS Sidebar/Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Pages AVEC Sidebar/Navbar */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        {/* 2. AJOUT DE LA ROUTE ICI */}
        <Route path="/MealScanner" element={<Layout><MealScanner /></Layout>} />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;