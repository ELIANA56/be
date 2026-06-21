/**
 * LOGIN PAGE — Sign in with email/password or Google.
 * On success: save token + userId, go to /home.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithGoogle, saveAuthSession } from '../../utils/authSession';
import AuthCard from './AuthCard';
import GoogleAuthSection, { AuthSeparator } from './GoogleAuthSection';
import { authStyles as styles } from './authStyles';

const Login = () => {
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error (not JSON).');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      saveAuthSession(data);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      saveAuthSession(data);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Login" subtitle="Sign in with email or Google">

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="Email"
          placeholder="Email address"
          value={formData.Email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={formData.Password}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={{ ...styles.button, backgroundColor: '#6366f1' }} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in with email'}
        </button>
      </form>

      <AuthSeparator text="or continue with Google" />

      <GoogleAuthSection
        enabled={Boolean(googleClientId)}
        mode="signin"
        onSuccess={handleGoogleSuccess}
        onError={() => setError('Google sign-in was cancelled or failed.')}
      />

      {error && <p style={styles.error}>{error}</p>}

      <p style={styles.footer}>
        No account? <Link to="/register" style={styles.link}>Create one</Link>
      </p>
    </AuthCard>
  );
};

export default Login;
