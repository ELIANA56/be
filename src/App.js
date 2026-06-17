import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/dashboard/Home';
import Profile from './components/auth/Profile';
import Recipes from './components/dashboard/Recipes';
import Workout from './components/dashboard/Workout';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages without Sidebar/Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages with Sidebar/Navbar */}
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/workout" element={<Layout><Workout /></Layout>} />
        <Route path="/recipes" element={<Layout><Recipes /></Layout>} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;