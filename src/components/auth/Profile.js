import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    fetch(`http://localhost:3001/api/user/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error("Erreur:", err));
  }, []);

  // Fonction pour mettre à jour l'état local quand on tape dans les champs
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Ici, vous enverriez les données à votre API pour mettre à jour la BDD
    alert("Profil sauvegardé ! (Fonctionnalité API à connecter)");
    setIsEditing(false);
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>{user.Full_Name?.charAt(0) || '?'}</div>
      <h1>{user.Full_Name}</h1>
      
      <div style={styles.card}>
        <p>Âge : {user.Age} ans</p>
        
        <label>Poids (kg) : </label>
        <input name="Weight" value={user.Weight} onChange={handleChange} disabled={!isEditing} style={styles.input} />
        
        <label>Taille (cm) : </label>
        <input name="Height" value={user.Height} onChange={handleChange} disabled={!isEditing} style={styles.input} />
        
        <label>Objectif : </label>
        <input name="Goal_Type" value={user.Goal_Type} onChange={handleChange} disabled={!isEditing} style={styles.input} />
      </div>

      <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.button}>
        {isEditing ? "Enregistrer" : "Modifier"}
      </button>
    </div>
  );
};

const styles = {
  container: { textAlign: 'center', padding: '20px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' },
  card: { display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #ccc', borderRadius: '10px', padding: '15px', maxWidth: '300px', margin: '20px auto' },
  input: { padding: '5px', textAlign: 'center' },
  button: { marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }
};

export default Profile;