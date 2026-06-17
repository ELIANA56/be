import React, { useState, useEffect, useCallback } from 'react';
import MealScanner from './MealScanner';

const MEAL_TYPE_LABELS = {
  Breakfast: 'Petit-déjeuner',
  Lunch: 'Déjeuner',
  Dinner: 'Dîner',
  Snack: 'Collation',
};

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Home = () => {
  const [stats, setStats] = useState({ consumed: 0, budget: 0 });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMealId, setExpandedMealId] = useState(null);

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

      const statsData = await statsRes.json();
      const mealsData = await mealsRes.json();

      setStats(statsData);
      setMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch (err) {
      console.error('Erreur lors du chargement du tableau de bord:', err);
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

  const remaining = Math.max((stats.budget || 0) - (stats.consumed || 0), 0);
  const progress = stats.budget
    ? Math.min(Math.round((stats.consumed / stats.budget) * 100), 100)
    : 0;

  if (loading) return <div>Chargement de vos données...</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Tableau de bord</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Calories aujourd&apos;hui</h3>
          <p style={styles.bigValue}>
            {stats.consumed} <span style={styles.unit}>/ {stats.budget || 2000} kcal</span>
          </p>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={styles.remaining}>{remaining} kcal restantes</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.cardTitle}>Résumé du jour</h3>
          <p style={styles.summaryLine}><strong>{meals.length}</strong> repas enregistrés au total</p>
          <p style={styles.summaryLine}>
            <strong>{meals.filter((m) => new Date(m.Timestamp).toDateString() === new Date().toDateString()).length}</strong> repas scannés aujourd&apos;hui
          </p>
        </div>
      </div>

      <MealScanner onMealLogged={handleMealLogged} />

      <section style={styles.historySection}>
        <h2 style={styles.sectionTitle}>Historique des repas</h2>

        {meals.length === 0 ? (
          <p style={styles.empty}>Aucun repas scanné pour le moment. Utilisez le scanner ci-dessus.</p>
        ) : (
          <div style={styles.historyList}>
            {meals.map((meal) => {
              const isExpanded = expandedMealId === meal.Meal_ID;
              return (
                <article key={meal.Meal_ID} style={styles.mealCard}>
                  <div style={styles.mealHeader}>
                    <div>
                      <h3 style={styles.mealName}>
                        {meal.Food_Name || 'Repas sans nom'}
                      </h3>
                      <p style={styles.mealMeta}>
                        {MEAL_TYPE_LABELS[meal.Meal_Type] || meal.Meal_Type} · {formatDate(meal.Timestamp)}
                      </p>
                    </div>
                    <div style={styles.mealCalories}>{meal.Total_Calories} kcal</div>
                  </div>

                  <div style={styles.mealMacros}>
                    <span>P {meal.Protein_Grams}g</span>
                    <span>G {meal.Carbs_Grams}g</span>
                    <span>L {meal.Fats_Grams}g</span>
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
                      {isExpanded ? 'Voir moins' : 'Voir tous les détails'}
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
  remaining: { margin: '10px 0 0 0', color: '#6c757d', fontSize: '14px' },
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
};

export default Home;
