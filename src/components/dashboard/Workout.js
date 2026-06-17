import React, { useState, useEffect, useCallback } from 'react';

const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'Other'];

const Workout = () => {
  const userId = localStorage.getItem('userId');

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    Workout_Type: 'Running',
    Duration: '',
    Calories_Burned: '',
  });

  const loadWorkouts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workouts/user/${userId}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : [];
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading workouts:', err);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Please log in first.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: Number(userId),
          Workout_Type: form.Workout_Type,
          Duration: Number(form.Duration),
          Calories_Burned: Number(form.Calories_Burned),
        }),
      });

      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : {};

      if (!res.ok) throw new Error(data.error || 'Failed to log workout.');

      setForm({ Workout_Type: 'Running', Duration: '', Calories_Burned: '' });
      loadWorkouts();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return <div style={styles.page}>Please log in to track workouts.</div>;
  }

  const totalCalories = workouts.reduce((sum, w) => sum + (Number(w.Calories_Burned) || 0), 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + (Number(w.Duration) || 0), 0);

  return (
    <div style={styles.page}>
      <p style={styles.subtitle}>Log your workouts and see your activity history.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total workouts</h3>
          <p style={styles.bigValue}>{workouts.length}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total minutes</h3>
          <p style={styles.bigValue}>{totalMinutes}</p>
        </div>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Calories burned</h3>
          <p style={styles.bigValue}>{totalCalories}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Log a workout</h2>

        <label style={styles.label}>
          Type
          <select name="Workout_Type" value={form.Workout_Type} onChange={handleChange} style={styles.input}>
            {WORKOUT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Duration (minutes)
          <input
            type="number"
            name="Duration"
            value={form.Duration}
            onChange={handleChange}
            min="1"
            required
            style={styles.input}
            placeholder="30"
          />
        </label>

        <label style={styles.label}>
          Calories burned
          <input
            type="number"
            name="Calories_Burned"
            value={form.Calories_Burned}
            onChange={handleChange}
            min="1"
            required
            style={styles.input}
            placeholder="250"
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={saving} style={styles.submitBtn}>
          {saving ? 'Saving…' : 'Save workout'}
        </button>
      </form>

      <section>
        <h2 style={styles.sectionTitle}>Workout history</h2>
        {loading ? (
          <p>Loading…</p>
        ) : workouts.length === 0 ? (
          <p style={styles.empty}>No workouts logged yet.</p>
        ) : (
          <div style={styles.list}>
            {workouts.map((workout) => (
              <article key={workout.Workout_ID} style={styles.listCard}>
                <div>
                  <h3 style={styles.workoutName}>{workout.Workout_Type}</h3>
                  <p style={styles.workoutMeta}>{workout.Duration} min</p>
                </div>
                <span style={styles.calories}>{workout.Calories_Burned} kcal</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '24px' },
  subtitle: { margin: 0, color: '#6c757d' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  card: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: { margin: '0 0 8px', color: '#495057', fontSize: '14px' },
  bigValue: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#007bff' },
  formCard: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '400px',
  },
  sectionTitle: { margin: '0 0 8px', color: '#212529', fontSize: '18px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#495057' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px' },
  error: { color: '#dc3545', margin: 0 },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
  },
  empty: { color: '#6c757d', fontStyle: 'italic' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  workoutName: { margin: 0, fontSize: '16px', color: '#212529' },
  workoutMeta: { margin: '4px 0 0', fontSize: '13px', color: '#6c757d' },
  calories: { fontWeight: '700', color: '#28a745' },
};

export default Workout;
