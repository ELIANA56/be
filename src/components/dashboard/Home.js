/**
 * HOME (DASHBOARD) — Main page after login.
 *
 * Shows: calories eaten vs budget, protein, today's meals.
 * Uses MealScanner to log new meals. Edit/delete meals logged today.
 */
import React, { useState, useEffect, useCallback } from 'react';
import MealScanner from './MealScanner';
import { getToday, formatLogDate, normalizeLogDate, isToday } from '../../utils/dateFormat';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const MEAL_TYPE_LABELS = {
  Breakfast: 'Breakfast',
  Lunch: 'Lunch',
  Dinner: 'Dinner',
  Snack: 'Snack',
};

const mealDate = (meal) => normalizeLogDate(meal.Log_Date || meal.Timestamp);

const Home = () => {
  const [stats, setStats] = useState({ consumed: 0, budget: 0 });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMealId, setExpandedMealId] = useState(null);
  const [editingMealId, setEditingMealId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionError, setActionError] = useState('');

  const userId = localStorage.getItem('userId');

  const loadDashboard = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const [statsRes, mealsRes] = await Promise.all([
        fetch(`/api/dashboard/stats/${userId}`),
        fetch(`/api/meals/user/${userId}`),
      ]);

      const statsData = statsRes.headers.get('content-type')?.includes('application/json')
        ? await statsRes.json()
        : {};
      const mealsData = mealsRes.headers.get('content-type')?.includes('application/json')
        ? await mealsRes.json()
        : [];

      setStats(statsData);
      setMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleMealLogged = () => {
    loadDashboard();
  };

  const startEditMeal = (meal) => {
    setEditingMealId(meal.Meal_ID);
    setEditForm({
      Meal_Type: meal.Meal_Type || 'Lunch',
      Meal_Name: meal.Food_Name || '',
      Description: meal.Description || '',
      Total_Calories: meal.Total_Calories ?? '',
      Protein_Grams: meal.Protein_Grams ?? '',
      Carbs_Grams: meal.Carbs_Grams ?? '',
      Fats_Grams: meal.Fats_Grams ?? '',
    });
    setActionError('');
  };

  const cancelEditMeal = () => {
    setEditingMealId(null);
    setEditForm({});
    setActionError('');
  };

  const saveMealEdit = async () => {
    if (!editForm.Meal_Name?.trim() || Number(editForm.Total_Calories) <= 0) {
      setActionError('Name and calories are required.');
      return;
    }
    try {
      const res = await fetch(`/api/meals/${editingMealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: Number(userId),
          Meal_Type: editForm.Meal_Type,
          Meal_Name: editForm.Meal_Name.trim(),
          Description: editForm.Description,
          Total_Calories: Number(editForm.Total_Calories),
          Protein_Grams: Number(editForm.Protein_Grams) || 0,
          Carbs_Grams: Number(editForm.Carbs_Grams) || 0,
          Fats_Grams: Number(editForm.Fats_Grams) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      cancelEditMeal();
      loadDashboard();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const deleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal?')) return;
    try {
      const res = await fetch(`/api/meals/${mealId}?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      if (editingMealId === mealId) cancelEditMeal();
      loadDashboard();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const budget = Number(stats.adjustedBudget || stats.budget || 2000);
  const consumed = Number(stats.consumed || 0);
  const loggedTodayTypes = meals
    .filter((m) => isToday(m.Log_Date || m.Timestamp) && m.Meal_Type !== 'Snack')
    .map((m) => m.Meal_Type);

  const isMainTypeTaken = (type, excludeMealId) => {
    if (type === 'Snack') return false;
    return meals.some(
      (m) => isToday(m.Log_Date || m.Timestamp) && m.Meal_Type === type && m.Meal_ID !== excludeMealId
    );
  };

  const remaining = Math.max(budget - consumed, 0);
  const progress = budget
    ? Math.min(Math.round((consumed / budget) * 100), 100)
    : 0;

  const proteinTarget = Number(stats.proteinTarget || stats.baseProteinTarget || 84);
  const proteinConsumed = Number(
    stats.proteinConsumed ?? meals
      .filter((m) => isToday(m.Log_Date || m.Timestamp))
      .reduce((sum, m) => sum + (Number(m.Protein_Grams) || 0), 0)
  );
  const proteinRemaining = Math.max(Math.round(proteinTarget - proteinConsumed), 0);
  const proteinProgress = proteinTarget
    ? Math.min(Math.round((proteinConsumed / proteinTarget) * 100), 100)
    : 0;

  if (loading) return <div>Loading your data...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Dashboard</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Calories today</h3>
          <p style={styles.bigValue}>
            {consumed} <span style={styles.unit}>/ {budget} kcal</span>
          </p>
          {stats.workoutBonusCalories > 0 && (
            <p style={styles.bonusLine}>
              Includes +{stats.workoutBonusCalories} kcal from today&apos;s workouts
            </p>
          )}
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={styles.remaining}>{remaining} kcal remaining</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Protein today</h3>
          <p style={styles.proteinValue}>
            {Math.round(proteinConsumed)} <span style={styles.unit}>/ {proteinTarget}g</span>
          </p>
          {stats.extraProteinFromWorkout > 0 && (
            <p style={styles.bonusLine}>
              Target includes +{stats.extraProteinFromWorkout}g from today&apos;s workouts
            </p>
          )}
          <div style={styles.progressTrack}>
            <div style={{ ...styles.proteinFill, width: `${proteinProgress}%` }} />
          </div>
          <p style={styles.remaining}>
            {proteinProgress >= 100 ? 'Protein goal reached!' : `${proteinRemaining}g remaining`}
          </p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.cardTitle}>Today&apos;s summary</h3>
          <p style={styles.summaryLine}><strong>{meals.length}</strong> meals logged in total</p>
          <p style={styles.summaryLine}>
            <strong>{meals.filter((m) => isToday(m.Log_Date || m.Timestamp)).length}</strong> meals logged today
          </p>
        </div>
      </div>

      <MealScanner onMealLogged={handleMealLogged} loggedTodayTypes={loggedTodayTypes} />

      <section style={styles.historySection}>
        <h2 style={styles.sectionTitle}>Meal history</h2>
        {actionError && <p style={styles.actionError}>{actionError}</p>}

        {meals.length === 0 ? (
          <p style={styles.empty}>No meals scanned yet. Use the scanner above.</p>
        ) : (
          <div style={styles.historyList}>
            {meals.map((meal) => {
              const isExpanded = expandedMealId === meal.Meal_ID;
              const isEditing = editingMealId === meal.Meal_ID;

              if (isEditing) {
                return (
                  <article key={meal.Meal_ID} style={styles.mealCard}>
                    <span style={styles.dateBadge}>{formatLogDate(meal.Log_Date || meal.Timestamp)}</span>
                    <div style={styles.editForm}>
                      <label style={styles.editLabel}>
                        Meal type
                        <select
                          value={editForm.Meal_Type}
                          onChange={(e) => setEditForm({ ...editForm, Meal_Type: e.target.value })}
                          style={styles.editInput}
                        >
                          {MEAL_TYPES.map((t) => (
                            <option key={t} value={t} disabled={isMainTypeTaken(t, meal.Meal_ID)}>
                              {t}{isMainTypeTaken(t, meal.Meal_ID) ? ' — taken today' : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={styles.editLabel}>
                        Name
                        <input value={editForm.Meal_Name} onChange={(e) => setEditForm({ ...editForm, Meal_Name: e.target.value })} style={styles.editInput} />
                      </label>
                      <label style={styles.editLabel}>
                        Calories
                        <input type="number" value={editForm.Total_Calories} onChange={(e) => setEditForm({ ...editForm, Total_Calories: e.target.value })} style={styles.editInput} />
                      </label>
                      <div style={styles.editRow}>
                        <label style={styles.editLabel}>Protein (g)<input type="number" value={editForm.Protein_Grams} onChange={(e) => setEditForm({ ...editForm, Protein_Grams: e.target.value })} style={styles.editInput} /></label>
                        <label style={styles.editLabel}>Carbs (g)<input type="number" value={editForm.Carbs_Grams} onChange={(e) => setEditForm({ ...editForm, Carbs_Grams: e.target.value })} style={styles.editInput} /></label>
                        <label style={styles.editLabel}>Fat (g)<input type="number" value={editForm.Fats_Grams} onChange={(e) => setEditForm({ ...editForm, Fats_Grams: e.target.value })} style={styles.editInput} /></label>
                      </div>
                      <label style={styles.editLabel}>
                        Description
                        <textarea value={editForm.Description} onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })} style={styles.editTextarea} rows={2} />
                      </label>
                      <div style={styles.actionRow}>
                        <button type="button" onClick={saveMealEdit} style={styles.saveBtn}>Save</button>
                        <button type="button" onClick={cancelEditMeal} style={styles.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article key={meal.Meal_ID} style={styles.mealCard}>
                  <span style={styles.dateBadge}>
                    {formatLogDate(meal.Log_Date || meal.Timestamp)}
                  </span>
                  <div style={styles.mealHeader}>
                    <div>
                      <h3 style={styles.mealName}>
                        {meal.Food_Name || 'Unnamed meal'}
                      </h3>
                      <p style={styles.mealMeta}>
                        {MEAL_TYPE_LABELS[meal.Meal_Type] || meal.Meal_Type}
                      </p>
                    </div>
                    <div style={styles.mealActions}>
                      <div style={styles.mealCalories}>{meal.Total_Calories} kcal</div>
                      <div style={styles.actionRow}>
                        <button type="button" onClick={() => startEditMeal(meal)} style={styles.editBtn}>Edit</button>
                        <button type="button" onClick={() => deleteMeal(meal.Meal_ID)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.mealMacros}>
                    <span>Protein {meal.Protein_Grams}g</span>
                    <span>Carbs {meal.Carbs_Grams}g</span>
                    <span>Fat {meal.Fats_Grams}g</span>
                  </div>

                  {meal.Description && (
                    <p style={styles.mealDescription}>
                      {isExpanded ? meal.Description : `${meal.Description.slice(0, 120)}${meal.Description.length > 120 ? '...' : ''}`}
                    </p>
                  )}

                  {meal.Description && meal.Description.length > 120 && (
                    <button
                      type="button"
                      style={styles.toggleButton}
                      onClick={() => setExpandedMealId(isExpanded ? null : meal.Meal_ID)}
                    >
                      {isExpanded ? 'Show less' : 'Show all details'}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  heading: { margin: 0, color: '#212529' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  card: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 4px 6px rgba(0,0,0,0.08)',
  },
  summaryCard: {
    padding: '24px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  cardTitle: { margin: '0 0 12px 0', color: '#495057', fontSize: '16px' },
  bigValue: { margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#28a745' },
  proteinValue: { margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#007bff' },
  unit: { fontSize: '18px', color: '#6c757d', fontWeight: 'normal' },
  progressTrack: {
    marginTop: '16px',
    height: '10px',
    backgroundColor: '#e9ecef',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
    borderRadius: '999px',
    transition: 'width 0.3s ease',
  },
  proteinFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: '999px',
    transition: 'width 0.3s ease',
  },
  remaining: { margin: '10px 0 0 0', color: '#6c757d', fontSize: '14px' },
  bonusLine: { margin: '6px 0 0', fontSize: '13px', color: '#007bff' },
  summaryLine: { margin: '8px 0', color: '#495057' },
  historySection: { marginTop: '8px' },
  sectionTitle: { margin: '0 0 16px 0', color: '#212529' },
  empty: { color: '#6c757d', fontStyle: 'italic' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  mealCard: {
    padding: '18px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  dateBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#495057',
    backgroundColor: '#e9ecef',
    padding: '4px 10px',
    borderRadius: '12px',
    marginBottom: '10px',
  },
  mealHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  mealName: { margin: 0, fontSize: '18px', color: '#212529' },
  mealMeta: { margin: '6px 0 0 0', fontSize: '13px', color: '#6c757d' },
  mealCalories: { fontSize: '20px', fontWeight: 'bold', color: '#28a745', whiteSpace: 'nowrap' },
  mealMacros: { display: 'flex', gap: '16px', marginTop: '12px', fontSize: '14px', color: '#495057' },
  mealDescription: { margin: '12px 0 0 0', fontSize: '14px', color: '#495057', lineHeight: 1.5 },
  toggleButton: {
    marginTop: '10px',
    padding: 0,
    border: 'none',
    background: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  mealActions: { textAlign: 'right' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' },
  editBtn: { padding: '4px 10px', border: '1px solid #007bff', borderRadius: '6px', background: '#fff', color: '#007bff', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '4px 10px', border: '1px solid #dc3545', borderRadius: '6px', background: '#fff', color: '#dc3545', cursor: 'pointer', fontSize: '13px' },
  saveBtn: { padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#007bff', color: '#fff', cursor: 'pointer' },
  cancelBtn: { padding: '8px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' },
  editLabel: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#495057' },
  editInput: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' },
  editTextarea: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px' },
  editRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  actionError: { color: '#dc3545', marginBottom: '8px' },
};

export default Home;
