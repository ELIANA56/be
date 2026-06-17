import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isProfileComplete, profileFormFromUser, notifyProfileUpdated } from '../../utils/profileUtils';

const GOAL_OPTIONS = [
  { value: 'הרזיה', label: 'הרזיה (Weight loss)' },
  { value: 'מסה', label: 'מסה (Mass gain)' },
  { value: 'תחזוקה', label: 'תחזוקה (Maintenance)' },
];

const ACTIVITY_OPTIONS = [
  { value: '1.2', label: 'Sedentary (little or no exercise)' },
  { value: '1.375', label: 'Lightly active (1–3 days/week)' },
  { value: '1.55', label: 'Moderately active (3–5 days/week)' },
  { value: '1.725', label: 'Very active (6–7 days/week)' },
];

const emptyForm = profileFormFromUser(null);

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  const isFirstTimeSetup = Boolean(location.state?.firstTimeSetup);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasPassword, setHasPassword] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/user/${userId}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : null;
      if (!res.ok) throw new Error(data?.error || 'Failed to load profile.');
      setUser(data);
      setHasPassword(Boolean(data.hasPassword));
      setForm(profileFormFromUser(data));
      if (isFirstTimeSetup || !isProfileComplete(data)) {
        setIsEditing(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, isFirstTimeSetup]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (isFirstTimeSetup) {
      setSuccess('Welcome! Please complete your profile details to continue.');
    }
  }, [isFirstTimeSetup]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    if (isFirstTimeSetup || !isProfileComplete(user)) return;
    setIsEditing(false);
    setError('');
    setSuccess('');
    setForm(profileFormFromUser(user));
  };

  const handleSave = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body = {
        Full_Name: form.Full_Name,
        Age: Number(form.Age),
        Weight: Number(form.Weight),
        Height: Number(form.Height),
        Gender: form.Gender,
        Goal_Type: form.Goal_Type,
        Activity_Factor: Number(form.Activity_Factor),
        Email: form.Email,
      };
      if (form.New_Password) {
        body.New_Password = form.New_Password;
        if (hasPassword) body.Current_Password = form.Current_Password;
      }

      const res = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : {};

      if (!res.ok) throw new Error(data.error || 'Failed to save profile.');

      setUser(data.user);
      setHasPassword(Boolean(data.user?.hasPassword));
      setForm((prev) => ({ ...prev, Current_Password: '', New_Password: '' }));
      setIsEditing(false);
      notifyProfileUpdated();

      if (isProfileComplete(data.user)) {
        setSuccess(
          data.Daily_Calorie_Budget
            ? `Profile saved! Your daily budget is ${data.Daily_Calorie_Budget} kcal. Redirecting...`
            : 'Profile saved! Redirecting...'
        );
        navigate('/home', { replace: true });
        return;
      }

      setSuccess(
        data.Daily_Calorie_Budget
          ? `Profile saved. Your daily calorie budget is now ${data.Daily_Calorie_Budget} kcal.`
          : 'Profile saved.'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <div style={styles.page}>
        <p>Please log in to view your profile.</p>
        <button type="button" style={styles.primaryBtn} onClick={() => navigate('/login')}>
          Go to login
        </button>
      </div>
    );
  }

  if (loading) return <div style={styles.page}>Loading profile...</div>;

  const budget = user?.Daily_Calorie_Budget;
  const profileIncomplete = !isProfileComplete(user);
  const setupMode = isFirstTimeSetup || profileIncomplete;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Profile</h1>

      {profileIncomplete && (
        <div style={styles.alert}>
          Complete your profile (name, age, weight, height, gender, goal, email) to unlock Home, Recipes, and Workout.
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.hero}>
        <div style={styles.avatar}>{user?.Full_Name?.charAt(0)?.toUpperCase() || '?'}</div>
        <div>
          <h2 style={styles.name}>{user?.Full_Name || 'User'}</h2>
          <p style={styles.email}>{user?.Email}</p>
        </div>
      </div>

      <div style={styles.budgetCard}>
        <span style={styles.budgetLabel}>Daily calorie budget</span>
        <span style={styles.budgetValue}>
          {budget ? `${budget} kcal` : 'Not set yet'}
        </span>
        <p style={styles.budgetNote}>
          Calculated from your age, weight, height, gender, activity level, and goal. This cannot be edited manually.
        </p>
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Personal details</h3>
          <Field label="Full name" name="Full_Name" value={form.Full_Name} onChange={handleChange} disabled={!isEditing} />
          <Field label="Age" name="Age" type="number" value={form.Age} onChange={handleChange} disabled={!isEditing} />
          <SelectField
            label="Gender"
            name="Gender"
            value={form.Gender}
            onChange={handleChange}
            disabled={!isEditing}
            options={[
              { value: '', label: 'Select gender' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
            ]}
          />
        </section>

        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Body stats</h3>
          <Field label="Weight (kg)" name="Weight" type="number" step="0.1" value={form.Weight} onChange={handleChange} disabled={!isEditing} />
          <Field label="Height (cm)" name="Height" type="number" value={form.Height} onChange={handleChange} disabled={!isEditing} />
        </section>

        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Goal & activity</h3>
          <SelectField
            label="Goal"
            name="Goal_Type"
            value={form.Goal_Type}
            onChange={handleChange}
            disabled={!isEditing}
            options={GOAL_OPTIONS}
          />
          <SelectField
            label="Activity level"
            name="Activity_Factor"
            value={form.Activity_Factor}
            onChange={handleChange}
            disabled={!isEditing}
            options={ACTIVITY_OPTIONS}
          />
        </section>

        <section style={styles.card}>
          <h3 style={styles.cardTitle}>Account</h3>
          <Field label="Email" name="Email" type="email" value={form.Email} onChange={handleChange} disabled={!isEditing} />
          {isEditing && (
            <>
              {hasPassword && (
                <Field
                  label="Current password"
                  name="Current_Password"
                  type="password"
                  value={form.Current_Password}
                  onChange={handleChange}
                  placeholder="Required to change password"
                />
              )}
              <Field
                label={hasPassword ? 'New password (optional)' : 'Set password (optional)'}
                name="New_Password"
                type="password"
                value={form.New_Password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
              />
            </>
          )}
          {!isEditing && (
            <p style={styles.hint}>Password is hidden. Click Edit to change email or password.</p>
          )}
        </section>
      </div>

      <div style={styles.actions}>
        {isEditing ? (
          <>
            {!setupMode && (
              <button type="button" style={styles.secondaryBtn} onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            )}
            <button type="button" style={styles.primaryBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : setupMode ? 'Save and continue' : 'Save changes'}
            </button>
          </>
        ) : (
          <button type="button" style={styles.primaryBtn} onClick={() => setIsEditing(true)}>
            Edit profile
          </button>
        )}
      </div>
    </div>
  );
};

function Field({ label, name, value, onChange, disabled, type = 'text', step, placeholder }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{ ...styles.input, ...(disabled ? styles.inputDisabled : {}) }}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, disabled, options }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ ...styles.input, ...(disabled ? styles.inputDisabled : {}) }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

const styles = {
  page: { padding: '8px 4px 32px', maxWidth: '900px' },
  heading: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '20px', color: '#1a1a2e' },
  hero: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: '28px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: { margin: 0, fontSize: '1.35rem', color: '#1a1a2e' },
  email: { margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' },
  budgetCard: {
    background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
    border: '1px solid #c7d2fe',
    borderRadius: '14px',
    padding: '20px 24px',
    marginBottom: '24px',
  },
  budgetLabel: { display: 'block', fontSize: '0.85rem', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' },
  budgetValue: { display: 'block', fontSize: '2rem', fontWeight: 700, color: '#4338ca', margin: '6px 0' },
  budgetNote: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTitle: { margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: '#334155' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.8rem', fontWeight: 500, color: '#64748b' },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    background: '#fff',
  },
  inputDisabled: { background: '#f8fafc', color: '#475569' },
  hint: { margin: 0, fontSize: '0.8rem', color: '#94a3b8' },
  actions: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' },
  primaryBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  secondaryBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  alert: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    color: '#92400e',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
  success: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '0.9rem',
  },
};

export default Profile;
