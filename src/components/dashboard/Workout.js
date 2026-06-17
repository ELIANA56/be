import React, { useState, useEffect, useCallback } from 'react';
import { getToday, formatLogDate } from '../../utils/dateFormat';

const WORKOUT_TYPES = ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'Other'];
const INTENSITY_LEVELS = ['Light', 'Moderate', 'Intense'];

const Workout = () => {
  const userId = localStorage.getItem('userId');

  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastNutrition, setLastNutrition] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    Workout_Type: 'Running',
    Duration: '',
    Intensity: 'Moderate',
    Calories_Burned: '',
    Notes: '',
  });

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        fetch(`/api/workouts/user/${userId}`),
        fetch(`/api/workouts/today/${userId}`),
      ]);

      const list = listRes.headers.get('content-type')?.includes('application/json')
        ? await listRes.json()
        : [];
      const today = summaryRes.headers.get('content-type')?.includes('application/json')
        ? await summaryRes.json()
        : null;

      setWorkouts(Array.isArray(list) ? list : []);
      setSummary(today);
    } catch (err) {
      console.error('Error loading workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fetchEstimate = useCallback(async (type, duration, intensity) => {
    if (!userId || !duration || Number(duration) <= 0) return;
    try {
      const params = new URLSearchParams({
        userId,
        type,
        duration,
        intensity,
      });
      const res = await fetch(`/api/workouts/estimate?${params}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : {};
      if (data.caloriesBurned) {
        setForm((prev) => ({ ...prev, Calories_Burned: String(data.caloriesBurned) }));
      }
    } catch (err) {
      console.error('Estimate error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (form.Duration) {
      fetchEstimate(form.Workout_Type, form.Duration, form.Intensity);
    }
  }, [form.Workout_Type, form.Duration, form.Intensity, fetchEstimate]);

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
    setLastNutrition(null);

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: Number(userId),
          Workout_Type: form.Workout_Type,
          Duration: Number(form.Duration),
          Intensity: form.Intensity,
          Calories_Burned: form.Calories_Burned ? Number(form.Calories_Burned) : undefined,
          Notes: form.Notes,
          Log_Date: getToday(),
        }),
      });

      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : {};

      if (!res.ok) throw new Error(data.error || 'Failed to log workout.');

      setLastNutrition(data.nutrition);
      setForm({
        Workout_Type: 'Running',
        Duration: '',
        Intensity: 'Moderate',
        Calories_Burned: '',
        Notes: '',
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (workout) => {
    setEditingId(workout.Workout_ID);
    setEditForm({
      Workout_Type: workout.Workout_Type,
      Duration: workout.Duration,
      Intensity: workout.Intensity || 'Moderate',
      Calories_Burned: workout.Calories_Burned,
      Notes: workout.Notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/workouts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: Number(userId),
          ...editForm,
          Duration: Number(editForm.Duration),
          Calories_Burned: Number(editForm.Calories_Burned),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      cancelEdit();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteWorkout = async (workoutId) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      const res = await fetch(`/api/workouts/${workoutId}?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      if (editingId === workoutId) cancelEdit();
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!userId) {
    return <div style={styles.page}>Please log in to track workouts.</div>;
  }

  return (
    <div style={styles.page}>
      <p style={styles.subtitle}>
        Log what sport you did and for how long. After exercise you can eat a bit more — and you may need extra protein for recovery.
      </p>

      {summary && (
        <div style={styles.tipCard}>
          <h3 style={styles.tipTitle}>Today after your workouts</h3>
          {summary.count === 0 ? (
            <p style={styles.tipText}>No workouts logged today yet. Log one below to see your extra calories and protein.</p>
          ) : (
            <>
              <p style={styles.tipHighlight}>
                +{summary.extraCaloriesAllowed} kcal you can add to your food today
              </p>
              <p style={styles.tipText}>
                Protein target today: <strong>{summary.totalProteinTarget}g</strong>
                {' '}(base {summary.baseProteinTarget}g + {summary.extraProteinGrams}g from exercise)
              </p>
              <p style={styles.tipSmall}>
                You burned ~{summary.caloriesBurned} kcal in {summary.totalMinutes} min across {summary.count} workout(s).
              </p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.formCard}>
        <h2 style={styles.sectionTitle}>Log a new workout</h2>
        <p style={styles.formHint}>Saved with today&apos;s date automatically.</p>

        <label style={styles.label}>
          What kind of sport?
          <select name="Workout_Type" value={form.Workout_Type} onChange={handleChange} style={styles.input}>
            {WORKOUT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          How long? (minutes)
          <input
            type="number"
            name="Duration"
            value={form.Duration}
            onChange={handleChange}
            min="1"
            required
            style={styles.input}
            placeholder="e.g. 45"
          />
        </label>

        <label style={styles.label}>
          How hard was it?
          <select name="Intensity" value={form.Intensity} onChange={handleChange} style={styles.input}>
            {INTENSITY_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Calories burned (auto-estimated — you can edit)
          <input
            type="number"
            name="Calories_Burned"
            value={form.Calories_Burned}
            onChange={handleChange}
            min="1"
            style={styles.input}
            placeholder="Estimated from your weight"
          />
        </label>

        <label style={styles.label}>
          Notes (optional)
          <textarea
            name="Notes"
            value={form.Notes}
            onChange={handleChange}
            rows={2}
            style={styles.textarea}
            placeholder="e.g. morning run, leg day…"
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={saving} style={styles.submitBtn}>
          {saving ? 'Saving…' : 'Save workout'}
        </button>

        {lastNutrition && (
          <div style={styles.resultBox}>
            <strong>Great job!</strong>
            <p style={styles.tipText}>{lastNutrition.tip}</p>
          </div>
        )}
      </form>

      <section>
        <h2 style={styles.sectionTitle}>Workout history</h2>
        {loading ? (
          <p>Loading…</p>
        ) : workouts.length === 0 ? (
          <p style={styles.empty}>No workouts logged yet.</p>
        ) : (
          <div style={styles.list}>
            {workouts.map((workout) => {
              const isEditing = editingId === workout.Workout_ID;

              if (isEditing) {
                return (
                  <article key={workout.Workout_ID} style={styles.listCard}>
                    <div style={styles.editBlock}>
                      <span style={styles.dateBadge}>{formatLogDate(workout.Log_Date || workout.Logged_At)}</span>
                      <select value={editForm.Workout_Type} onChange={(e) => setEditForm({ ...editForm, Workout_Type: e.target.value })} style={styles.input}>
                        {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="number" value={editForm.Duration} onChange={(e) => setEditForm({ ...editForm, Duration: e.target.value })} style={styles.input} placeholder="Minutes" />
                      <select value={editForm.Intensity} onChange={(e) => setEditForm({ ...editForm, Intensity: e.target.value })} style={styles.input}>
                        {INTENSITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <input type="number" value={editForm.Calories_Burned} onChange={(e) => setEditForm({ ...editForm, Calories_Burned: e.target.value })} style={styles.input} placeholder="Calories" />
                      <input value={editForm.Notes} onChange={(e) => setEditForm({ ...editForm, Notes: e.target.value })} style={styles.input} placeholder="Notes" />
                      <div style={styles.actionRow}>
                        <button type="button" onClick={saveEdit} style={styles.saveBtn}>Save</button>
                        <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
              <article key={workout.Workout_ID} style={styles.listCard}>
                <div>
                  <span style={styles.dateBadge}>
                    {formatLogDate(workout.Log_Date || workout.Logged_At)}
                  </span>
                  <h3 style={styles.workoutName}>{workout.Workout_Type}</h3>
                  <p style={styles.workoutMeta}>
                    {workout.Duration} min · {workout.Intensity || 'Moderate'}
                    {workout.Notes ? ` · ${workout.Notes}` : ''}
                  </p>
                  {(workout.Extra_Calories > 0 || workout.Extra_Protein > 0) && (
                    <p style={styles.bonus}>
                      +{workout.Extra_Calories || 0} kcal · +{workout.Extra_Protein || 0}g protein
                    </p>
                  )}
                  <div style={styles.actionRow}>
                    <button type="button" onClick={() => startEdit(workout)} style={styles.editBtn}>Edit</button>
                    <button type="button" onClick={() => deleteWorkout(workout.Workout_ID)} style={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
                <span style={styles.calories}>{workout.Calories_Burned} kcal burned</span>
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
  subtitle: { margin: 0, color: '#6c757d', lineHeight: 1.5 },
  tipCard: {
    padding: '20px',
    backgroundColor: '#e8f4fd',
    borderRadius: '12px',
    border: '1px solid #b6d4fe',
  },
  tipTitle: { margin: '0 0 8px', color: '#212529', fontSize: '16px' },
  tipHighlight: { margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#007bff' },
  tipText: { margin: '0 0 6px', color: '#495057', fontSize: '14px' },
  tipSmall: { margin: 0, color: '#6c757d', fontSize: '13px' },
  formCard: {
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '480px',
  },
  formHint: { margin: '0 0 12px', fontSize: '13px', color: '#6c757d' },
  sectionTitle: { margin: '0 0 8px', color: '#212529', fontSize: '18px' },
  label: { display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#495057' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px' },
  textarea: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' },
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
  resultBox: {
    padding: '12px',
    backgroundColor: '#f0fff4',
    borderRadius: '8px',
    border: '1px solid #badbcc',
  },
  empty: { color: '#6c757d', fontStyle: 'italic' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
  },
  workoutName: { margin: '8px 0 0', fontSize: '16px', color: '#212529' },
  dateBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#495057',
    backgroundColor: '#e9ecef',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  workoutMeta: { margin: '4px 0 0', fontSize: '13px', color: '#6c757d' },
  bonus: { margin: '6px 0 0', fontSize: '13px', color: '#007bff', fontWeight: '600' },
  calories: { fontWeight: '700', color: '#28a745', whiteSpace: 'nowrap' },
  actionRow: { display: 'flex', gap: '8px', marginTop: '10px' },
  editBtn: { padding: '4px 10px', border: '1px solid #007bff', borderRadius: '6px', background: '#fff', color: '#007bff', cursor: 'pointer', fontSize: '13px' },
  deleteBtn: { padding: '4px 10px', border: '1px solid #dc3545', borderRadius: '6px', background: '#fff', color: '#dc3545', cursor: 'pointer', fontSize: '13px' },
  saveBtn: { padding: '8px 14px', border: 'none', borderRadius: '6px', background: '#007bff', color: '#fff', cursor: 'pointer' },
  cancelBtn: { padding: '8px 14px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' },
  editBlock: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' },
};

export default Workout;
