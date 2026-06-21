/**
 * APP.JS — Main entry for routing (which page shows for each URL).
 *
 * Public pages: /login, /register
 * Protected pages: /home, /profile, /workout, /recipes
 *   → wrapped in ProtectedRoute (must be logged in)
 *   → most also use Layout (sidebar + navbar)
 *
 * GoogleOAuthProvider wraps the app so the Google sign-in button works.
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/dashboard/Home';
import Profile from './components/auth/Profile';
import Recipes from './components/dashboard/Recipes';
import Workout from './components/dashboard/Workout';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute requireProfileComplete={false}><Layout><Profile /></Layout></ProtectedRoute>}
          />
          <Route
            path="/workout"
            element={<ProtectedRoute><Layout><Workout /></Layout></ProtectedRoute>}
          />
          <Route
            path="/recipes"
            element={<ProtectedRoute><Layout><Recipes /></Layout></ProtectedRoute>}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;