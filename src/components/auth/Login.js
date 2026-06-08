import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // 1. DÉCLARATION DES ÉTATS (C'est ce qui manquait)
  const [formData, setFormData] = useState({ Email: '', Password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // 2. FONCTION POUR GÉRER LA SAISIE (Manquait aussi)
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      
      navigate('/home');
    } catch (err) {
      setError(err.message); // Maintenant setError est défini
    }
  };

  return (
    <div style={styles.container}>
      <h2>Connexion - BeHealthy</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" name="Email" placeholder="Adresse Email" 
          onChange={handleChange} required style={styles.input} 
        />
        <input 
          type="password" name="Password" placeholder="Mot de passe" 
          onChange={handleChange} required style={styles.input} 
        />
        <button type="submit" style={styles.button}>Se connecter</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { margin: '10px 0', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default Login;