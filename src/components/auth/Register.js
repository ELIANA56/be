import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const text = await response.text();

      if (!response.ok) {
        console.error('Server error:', text);
        throw new Error(text || 'Registration failed.');
      }

      const data = JSON.parse(text);

      setMessage(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);

      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="Full_Name" placeholder="Full name" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Age" placeholder="Age" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Weight" placeholder="Weight (kg)" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Height" placeholder="Height (cm)" onChange={handleChange} required style={styles.input} />

        <select name="Gender" onChange={handleChange} required style={styles.input}>
          <option value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select name="Goal_Type" onChange={handleChange} required style={styles.input}>
          <option value="">Goal</option>
          <option value="הרזיה">הרזיה (Weight loss)</option>
          <option value="מסה">מסה (Mass gain)</option>
          <option value="תחזוקה">תחזוקה (Maintenance)</option>
        </select>

        <label>Activity level:</label>
        <select name="Activity_Factor" onChange={handleChange} style={styles.input}>
          <option value="1.2">Sedentary</option>
          <option value="1.375">Lightly active</option>
          <option value="1.55">Moderately active</option>
          <option value="1.725">Very active</option>
        </select>

        <input type="email" name="Email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        <input type="password" name="Password" placeholder="Password" onChange={handleChange} required style={styles.input} />

        <button type="submit" style={styles.button}>Create account</button>
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
  button: { padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default Register;
