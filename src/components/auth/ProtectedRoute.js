/**
 * PROTECTED ROUTE — Gatekeeper for pages that need login.
 *
 * 1. No userId in localStorage → send to /login
 * 2. Profile incomplete → send to /profile (first-time setup)
 * 3. Otherwise → show the page (children)
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isProfileComplete, PROFILE_UPDATED_EVENT } from '../../utils/profileUtils';

const ProtectedRoute = ({ children, requireProfileComplete = true }) => {
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const [loading, setLoading] = useState(Boolean(userId && requireProfileComplete));
  const [profileComplete, setProfileComplete] = useState(false);

  const checkProfile = useCallback(async () => {
    if (!userId || !requireProfileComplete) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/user/${userId}`);
      const data = await res.json();
      setProfileComplete(res.ok && isProfileComplete(data));
    } catch (e) {
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, [requireProfileComplete, userId]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile, location.pathname]);

  useEffect(() => {
    window.addEventListener(PROFILE_UPDATED_EVENT, checkProfile);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, checkProfile);
  }, [checkProfile]);

  if (!userId) return <Navigate to="/login" replace />;
  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  if (requireProfileComplete && !profileComplete && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace state={{ firstTimeSetup: true }} />;
  }

  return children;
};

export default ProtectedRoute;
