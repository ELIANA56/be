import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch('http://localhost:3001/api/auth/firebase/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Google login failed');

      localStorage.setItem('firebaseUID', user.uid);
      localStorage.setItem('firebaseToken', idToken);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || '');
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Connexion - BeHealthy</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="Email"
          placeholder="Adresse Email"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="Password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div style={styles.separator}>ou</div>

      <button
        type="button"
        style={styles.googleButton}
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? 'Connexion Google...' : 'Se connecter avec Google'}
      </button>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'Arial',
    textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column' },
  input: { margin: '10px 0', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' },
  separator: { margin: '20px 0', fontSize: '14px', color: '#666' },
  googleButton: { padding: '10px', fontSize: '16px', backgroundColor: '#4285F4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default Login;
