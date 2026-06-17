import React, { useState } from 'react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealScanner({ onMealLogged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [result, setResult] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Veuillez vous connecter pour scanner un repas.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      setLoading(true);
      setError('');
      setResult(null);

      try {
        const response = await fetch('/api/meals/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            User_ID: userId,
            Meal_Type: mealType,
            Image_Base64: base64Image,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Analyse échouée');

        setResult(data.analysis);
        if (onMealLogged) onMealLogged(data);
      } catch (err) {
        console.error('Erreur :', err);
        setError(err.message || 'Impossible d\'analyser le repas.');
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    };
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scanner un repas</h2>
      <p style={styles.subtitle}>Gemini analyse votre photo et estime les calories et macros.</p>

      <div style={styles.controls}>
        <label style={styles.label}>
          Type de repas
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            style={styles.select}
            disabled={loading}
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label style={styles.uploadButton}>
          {loading ? 'Analyse en cours...' : '📷 Choisir une photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.resultCard}>
          <h3>{result.Meal_Name || 'Repas analysé'}</h3>
          {result.Description && <p style={styles.description}>{result.Description}</p>}
          <div style={styles.macros}>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{result.Total_Calories}</span>
              <span style={styles.macroLabel}>kcal</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{result.Protein_Grams}g</span>
              <span style={styles.macroLabel}>Protéines</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{result.Carbs_Grams}g</span>
              <span style={styles.macroLabel}>Glucides</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{result.Fats_Grams}g</span>
              <span style={styles.macroLabel}>Lipides</span>
            </div>
          </div>
          {Array.isArray(result.Ingredients) && result.Ingredients.length > 0 && (
            <div style={styles.ingredients}>
              <strong>Ingrédients détectés :</strong>
              <ul>
                {result.Ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
    padding: '24px',
  },
  title: { margin: '0 0 8px 0', color: '#212529' },
  subtitle: { margin: '0 0 20px 0', color: '#6c757d', fontSize: '14px' },
  controls: { display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#495057' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #ced4da', fontSize: '14px' },
  uploadButton: {
    display: 'inline-block',
    padding: '10px 18px',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  error: { color: '#dc3545', marginTop: '12px' },
  resultCard: { marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
  description: { color: '#495057', marginBottom: '16px' },
  macros: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  macroItem: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  macroValue: { display: 'block', fontSize: '20px', fontWeight: 'bold', color: '#28a745' },
  macroLabel: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '4px' },
  ingredients: { marginTop: '16px', fontSize: '14px', color: '#495057' },
};

export default MealScanner;
