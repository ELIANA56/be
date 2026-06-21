/**
 * REGISTER PAGE — Create account with full profile (email path) or Google.
 * Email register → /home. Google register → /profile (finish missing fields).
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginWithGoogle, saveAuthSession } from '../../utils/authSession';
import AuthCard from './AuthCard';
import GoogleAuthSection, { AuthSeparator } from './GoogleAuthSection';
import { authStyles as styles } from './authStyles';

const Register = () => {
  const navigate = useNavigate();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const [formData, setFormData] = useState({
    Full_Name: '',
    Age: '',
    Weight: '',
    Height: '',
    Goal_Type: '',
    Gender: '',
    Email: '',
    Password: '',
    Activity_Factor: '1.2',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : { error: await response.text() };

      if (!response.ok) throw new Error(data.error || 'Registration failed.');

      setMessage(data.message);
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
    setMessage('');
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      saveAuthSession(data);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Register with email or Google">
      <GoogleAuthSection
        enabled={Boolean(googleClientId)}
        mode="signup"
        onSuccess={handleGoogleSuccess}
        onError={() => setError('Google sign-up was cancelled or failed.')}
      />

      <AuthSeparator text="or register with email" />

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="Full_Name" placeholder="Full name" value={formData.Full_Name} onChange={handleChange} required style={styles.input} />
        <input type="number" name="Age" placeholder="Age" value={formData.Age} onChange={handleChange} required style={styles.input} />
        <input type="number" name="Weight" placeholder="Weight (kg)" value={formData.Weight} onChange={handleChange} required style={styles.input} />
        <input type="number" name="Height" placeholder="Height (cm)" value={formData.Height} onChange={handleChange} required style={styles.input} />

        <select name="Gender" value={formData.Gender} onChange={handleChange} required style={styles.input}>
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select name="Goal_Type" value={formData.Goal_Type} onChange={handleChange} required style={styles.input}>
          <option value="">Goal</option>
          <option value="הרזיה">הרזיה (Weight loss)</option>
          <option value="מסה">מסה (Mass gain)</option>
          <option value="תחזוקה">תחזוקה (Maintenance)</option>
        </select>

        <select name="Activity_Factor" value={formData.Activity_Factor} onChange={handleChange} style={styles.input}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Lightly active</option>
          <option value="1.55">Moderately active</option>
          <option value="1.725">Very active</option>
        </select>

        <input type="email" name="Email" placeholder="Email" value={formData.Email} onChange={handleChange} required style={styles.input} />
        <input type="password" name="Password" placeholder="Password (min. 8 characters)" value={formData.Password} onChange={handleChange} required style={styles.input} />

        <button type="submit" style={{ ...styles.button, backgroundColor: '#22c55e' }} disabled={loading}>
          {loading ? 'Creating account...' : 'Create account with email'}
        </button>
      </form>

      {message && <p style={styles.success}>{message}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <p style={styles.footer}>
        Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
      </p>
    </AuthCard>
  );
};

export default Register;
