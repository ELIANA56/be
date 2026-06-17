import React, { useState, useEffect, useCallback } from 'react';
import { getToday } from '../../utils/dateFormat';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const emptyForm = {
  Meal_Name: '',
  Description: '',
  Total_Calories: '',
  Protein_Grams: '',
  Carbs_Grams: '',
  Fats_Grams: '',
  Ingredients: '',
};

function isEmptyAnalysis(analysis) {
  if (!analysis) return true;
  return (
    Number(analysis.Total_Calories) === 0 &&
    Number(analysis.Protein_Grams) === 0 &&
    Number(analysis.Carbs_Grams) === 0 &&
    Number(analysis.Fats_Grams) === 0
  );
}

function analysisToForm(analysis) {
  if (!analysis) return { ...emptyForm };
  return {
    Meal_Name: analysis.Meal_Name || '',
    Description: analysis.Description || '',
    Total_Calories: analysis.Total_Calories ?? '',
    Protein_Grams: analysis.Protein_Grams ?? '',
    Carbs_Grams: analysis.Carbs_Grams ?? '',
    Fats_Grams: analysis.Fats_Grams ?? '',
    Ingredients: Array.isArray(analysis.Ingredients) ? analysis.Ingredients.join(', ') : '',
  };
}

function MealScanner({ onMealLogged, loggedTodayTypes = [] }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loggedTypes, setLoggedTypes] = useState(loggedTodayTypes);
  const [typesLoaded, setTypesLoaded] = useState(false);
  const [mealType, setMealType] = useState('');

  const isTypeTaken = (type) => type !== 'Snack' && loggedTypes.includes(type);

  const pickFirstAvailable = (taken) => {
    const isTaken = (type) => type !== 'Snack' && taken.includes(type);
    return MEAL_TYPES.find((t) => !isTaken(t)) || 'Snack';
  };

  const loadTodayTypes = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setTypesLoaded(true);
      return;
    }
    try {
      const res = await fetch(`/api/meals/today-types/${userId}?date=${getToday()}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : { logged: [] };
      const taken = Array.isArray(data.logged) ? data.logged : [];
      setLoggedTypes(taken);
      setMealType((current) => {
        const takenCheck = (type) => type !== 'Snack' && taken.includes(type);
        if (current && !takenCheck(current)) return current;
        return pickFirstAvailable(taken);
      });
    } catch (err) {
      console.error('Error loading today meal types:', err);
    } finally {
      setTypesLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadTodayTypes();
  }, [loadTodayTypes]);

  useEffect(() => {
    if (loggedTodayTypes.length > 0) {
      setLoggedTypes(loggedTodayTypes);
      setMealType((current) => {
        const isTaken = (type) => type !== 'Snack' && loggedTodayTypes.includes(type);
        if (current && !isTaken(current)) return current;
        return pickFirstAvailable(loggedTodayTypes);
      });
    }
  }, [loggedTodayTypes]);

  useEffect(() => {
    if (typesLoaded && mealType && isTypeTaken(mealType)) {
      setMealType(pickFirstAvailable(loggedTypes));
    }
  }, [typesLoaded, loggedTypes, mealType]);
  const [preview, setPreview] = useState(null);
  const [needsManual, setNeedsManual] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const resetPreview = () => {
    setPreview(null);
    setNeedsManual(false);
    setIsEditing(false);
    setForm(emptyForm);
    setError('');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please sign in to scan a meal.');
      return;
    }

    if (isTypeTaken(mealType)) {
      setError(`You already logged ${mealType} today. Pick Snack or another available meal type before uploading.`);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      const mimeType = file.type || 'image/jpeg';
      setLoading(true);
      setError('');
      resetPreview();

      try {
        const response = await fetch('/api/meals/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Image_Base64: base64Image,
            Image_Mime_Type: mimeType,
          }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON server response:', text.slice(0, 200));
          throw new Error('Server error. Try again with a smaller photo.');
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Analysis failed');

        const analysis = data.analysis;
        const manual = data.needsManual || isEmptyAnalysis(analysis);

        setPreview(analysis);
        setNeedsManual(manual);
        setForm(analysisToForm(analysis));
        setIsEditing(manual);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Unable to analyze the meal.');
      } finally {
        setLoading(false);
        event.target.value = '';
      }
    };
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openManualEntry = () => {
    setIsEditing(true);
    setNeedsManual(true);
    if (isEmptyAnalysis(preview)) {
      setForm({ ...emptyForm, Meal_Name: preview?.Meal_Name || '' });
    }
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('Please sign in to save a meal.');
      return;
    }

    if (!form.Meal_Name.trim()) {
      setError('Please enter a meal name.');
      return;
    }
    if (!form.Total_Calories || Number(form.Total_Calories) <= 0) {
      setError('Please enter calories greater than 0.');
      return;
    }

    if (isTypeTaken(mealType)) {
      setError(`You already logged ${mealType} today. Choose a different meal type.`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/meals/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: userId,
          Meal_Type: mealType,
          Log_Date: getToday(),
          Meal_Name: form.Meal_Name.trim(),
          Description: form.Description,
          Total_Calories: Number(form.Total_Calories),
          Protein_Grams: Number(form.Protein_Grams) || 0,
          Carbs_Grams: Number(form.Carbs_Grams) || 0,
          Fats_Grams: Number(form.Fats_Grams) || 0,
          Ingredients: form.Ingredients,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save meal');

      resetPreview();
      await loadTodayTypes();
      if (onMealLogged) onMealLogged(data);
    } catch (err) {
      setError(err.message || 'Unable to save the meal.');
    } finally {
      setSaving(false);
    }
  };

  const showResults = preview && !isEditing && !needsManual;
  const showManualPrompt = preview && needsManual && !isEditing;
  const showEditForm = isEditing;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Scan a meal</h2>
      <p style={styles.subtitle}>
        Pick your meal type first. Breakfast, Lunch, and Dinner — once per day. Snacks anytime.
      </p>

      {!typesLoaded ? (
        <p style={styles.hint}>Checking which meals you already logged today…</p>
      ) : null}

      <div style={styles.controls}>
        <label style={styles.label}>
          Meal type
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            style={styles.select}
            disabled={loading || saving || !typesLoaded}
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type} disabled={isTypeTaken(type)}>
                {type}{isTypeTaken(type) ? ' — already logged today' : ''}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            ...styles.uploadButton,
            opacity: !typesLoaded || isTypeTaken(mealType) || loading || saving ? 0.5 : 1,
            pointerEvents: !typesLoaded || isTypeTaken(mealType) || loading || saving ? 'none' : 'auto',
          }}
        >
          {loading ? 'Analyzing...' : '📷 Choose a photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading || saving || !typesLoaded || isTypeTaken(mealType)}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {showManualPrompt && (
        <div style={styles.manualCard}>
          <p style={styles.manualText}>
            The AI could not estimate nutrition from this photo.
          </p>
          <button type="button" style={styles.manualButton} onClick={openManualEntry}>
            ✏️ Enter nutrition manually
          </button>
          <button type="button" style={styles.secondaryButton} onClick={resetPreview}>
            Try another photo
          </button>
        </div>
      )}

      {showResults && (
        <div style={styles.resultCard}>
          <h3>{preview.Meal_Name || 'Analyzed meal'}</h3>
          {preview.Description && <p style={styles.description}>{preview.Description}</p>}
          <div style={styles.macros}>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{preview.Total_Calories}</span>
              <span style={styles.macroLabel}>kcal</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{preview.Protein_Grams}g</span>
              <span style={styles.macroLabel}>Protein</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{preview.Carbs_Grams}g</span>
              <span style={styles.macroLabel}>Carbs</span>
            </div>
            <div style={styles.macroItem}>
              <span style={styles.macroValue}>{preview.Fats_Grams}g</span>
              <span style={styles.macroLabel}>Fat</span>
            </div>
          </div>
          {Array.isArray(preview.Ingredients) && preview.Ingredients.length > 0 && (
            <div style={styles.ingredients}>
              <strong>Detected ingredients:</strong>
              <ul>
                {preview.Ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div style={styles.actionRow}>
            <button type="button" style={styles.editButton} onClick={() => setIsEditing(true)}>
              ✏️ Edit values
            </button>
            <button type="button" style={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save meal'}
            </button>
          </div>
        </div>
      )}

      {showEditForm && (
        <div style={styles.editCard}>
          <h3 style={styles.editTitle}>
            {needsManual ? 'Enter meal details' : 'Edit meal details'}
          </h3>
          <div style={styles.formGrid}>
            <label style={styles.field}>
              Meal name *
              <input
                name="Meal_Name"
                value={form.Meal_Name}
                onChange={handleFormChange}
                placeholder="e.g. Grilled chicken salad"
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              Calories (kcal) *
              <input
                name="Total_Calories"
                type="number"
                min="1"
                value={form.Total_Calories}
                onChange={handleFormChange}
                placeholder="e.g. 450"
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              Protein (g)
              <input
                name="Protein_Grams"
                type="number"
                min="0"
                value={form.Protein_Grams}
                onChange={handleFormChange}
                placeholder="e.g. 30"
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              Carbs (g)
              <input
                name="Carbs_Grams"
                type="number"
                min="0"
                value={form.Carbs_Grams}
                onChange={handleFormChange}
                placeholder="e.g. 40"
                style={styles.input}
              />
            </label>
            <label style={styles.field}>
              Fat (g)
              <input
                name="Fats_Grams"
                type="number"
                min="0"
                value={form.Fats_Grams}
                onChange={handleFormChange}
                placeholder="e.g. 15"
                style={styles.input}
              />
            </label>
            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              Description
              <input
                name="Description"
                value={form.Description}
                onChange={handleFormChange}
                placeholder="Optional notes"
                style={styles.input}
              />
            </label>
            <label style={{ ...styles.field, gridColumn: '1 / -1' }}>
              Ingredients (comma separated)
              <input
                name="Ingredients"
                value={form.Ingredients}
                onChange={handleFormChange}
                placeholder="e.g. chicken, rice, broccoli"
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.actionRow}>
            {!needsManual && (
              <button type="button" style={styles.secondaryButton} onClick={() => setIsEditing(false)}>
                Back to preview
              </button>
            )}
            {needsManual && (
              <button type="button" style={styles.secondaryButton} onClick={resetPreview}>
                Cancel
              </button>
            )}
            <button type="button" style={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save meal'}
            </button>
          </div>
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
  subtitle: { margin: '0 0 12px 0', color: '#6c757d', fontSize: '14px' },
  hint: { margin: '0 0 16px 0', fontSize: '13px', color: '#007bff', backgroundColor: '#e8f4fd', padding: '10px 12px', borderRadius: '8px' },
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
  manualCard: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#fff8e6',
    borderRadius: '10px',
    border: '1px solid #ffc107',
    textAlign: 'center',
  },
  manualText: { margin: '0 0 16px 0', color: '#856404', fontSize: '15px' },
  manualButton: {
    padding: '12px 20px',
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    marginRight: '10px',
  },
  resultCard: { marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
  editCard: { marginTop: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
  editTitle: { margin: '0 0 16px 0', color: '#212529' },
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#495057' },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '14px',
  },
  actionRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' },
  editButton: {
    padding: '10px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  saveButton: {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  secondaryButton: {
    padding: '10px 16px',
    backgroundColor: '#fff',
    color: '#495057',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default MealScanner;
