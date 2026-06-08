import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importez useNavigate

const Register = () => {
  const navigate = useNavigate(); // 2. Initialisez la fonction de navigation
  
  const [formData, setFormData] = useState({
    Full_Name: '',
    Age: '',
    Weight: '',
    Height: '',
    Goal_Type: '',
    Gender: '',
    Email: '',
    Password: '',
    Activity_Factor: '1.2' 
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
 
        const text = await response.text();
        
        if (!response.ok) {
          console.error("Erreur serveur brute :", text);
          throw new Error(text || 'Erreur lors de l\'inscription.');
        }
 
        const data = JSON.parse(text);
 
        setMessage(data.message);
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        console.log('Inscription réussie, budget calculé :', data.Daily_Calorie_Budget);
        
        // 3. Redirection vers la page Home après succès
        navigate('/home'); 
        
      } catch (err) {
        setError(err.message);
      }
  };

  return (
    <div style={styles.container}>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="Full_Name" placeholder="Nom complet" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Age" placeholder="Âge" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Weight" placeholder="Poids (kg)" onChange={handleChange} required style={styles.input} />
        <input type="number" name="Height" placeholder="Taille (cm)" onChange={handleChange} required style={styles.input} />
        
        <select name="Gender" onChange={handleChange} required style={styles.input}>
          <option value="">Sexe</option>
          <option value="Male">Homme</option>
          <option value="Female">Femme</option>
        </select>

        <input name="Goal_Type" placeholder="Objectif (ex: Perte de poids)" onChange={handleChange} required style={styles.input} />
        
        <label>Niveau d'activité :</label>
        <select name="Activity_Factor" onChange={handleChange} style={styles.input}>
          <option value="1.2">Sédentaire</option>
          <option value="1.375">Légèrement actif</option>
          <option value="1.55">Modérément actif</option>
          <option value="1.725">Très actif</option>
        </select>

        <input type="email" name="Email" placeholder="Email" onChange={handleChange} required style={styles.input} />
        <input type="password" name="Password" placeholder="Mot de passe" onChange={handleChange} required style={styles.input} />

        <button type="submit" style={styles.button}>S'inscrire</button>
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
    button: { padding: '10px', fontSize: '16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default Register;