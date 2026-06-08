import React, { useState, useEffect } from 'react';

const Home = () => {
  const [data, setData] = useState({ consumed: 0, budget: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère l'ID utilisateur stocké lors de la connexion
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      fetch(`http://localhost:3001/api/dashboard/stats/${userId}`)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erreur lors de la récupération des stats:", err);
          setLoading(false);
        });
    }
  }, []);

  if (loading) return <div>Chargement de vos données...</div>;

  return (
    <div>
      <h1>Tableau de bord</h1>
      <div style={styles.card}>
        <h3>Calories consommées aujourd'hui</h3>
        <p style={styles.value}>{data.consumed} / {data.budget} kcal</p>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    padding: '25px', 
    backgroundColor: '#fff', 
    borderRadius: '12px', 
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '400px' 
  },
  value: { 
    fontSize: '28px', 
    fontWeight: 'bold', 
    color: '#28a745',
    margin: '10px 0 0 0'
  }
};

export default Home;