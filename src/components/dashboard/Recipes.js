import React, { useState, useEffect, useCallback } from 'react';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const FRIDGE_CATEGORIES = {
  Vegetables: ['Tomato', 'Cucumber', 'Bell pepper', 'Onion', 'Garlic', 'Carrot', 'Broccoli', 'Spinach', 'Zucchini', 'Mushrooms', 'Lettuce', 'Eggplant'],
  Fruits: ['Apple', 'Banana', 'Orange', 'Lemon', 'Avocado', 'Berries', 'Grapes'],
  'Fish & Protein': ['Salmon', 'Tuna', 'Cod', 'Eggs', 'Chicken breast', 'Tofu', 'Chickpeas', 'Lentils'],
  Dairy: ['Milk', 'Yogurt', 'Cheese', 'Cottage cheese', 'Butter'],
  'Whole grains': ['Brown rice', 'Quinoa', 'Oats', 'Whole wheat bread', 'Bulgur', 'Whole wheat pasta'],
  Pantry: ['Olive oil', 'Salt', 'Pepper', 'Honey', 'Nuts', 'Seeds', 'Canned tomatoes', 'Herbs'],
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DietTags = ({ recipe }) => (
  <div style={styles.tagRow}>
    {recipe.Gluten_Free && <span style={styles.tag}>Gluten-free</span>}
    {recipe.Vegetarian && <span style={styles.tag}>Vegetarian</span>}
    {recipe.Kosher && <span style={styles.tag}>Kosher</span>}
  </div>
);

const RecipeDetail = ({
  recipe,
  userId,
  onBack,
  onUpdated,
  onDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    Title: recipe.Recipe_Name || recipe.Title || '',
    Meal_Type: recipe.Meal_Type || 'Lunch',
    Prep_Time: recipe.Prep_Time || '',
    Calories_Per_Serving: recipe.Calories ?? recipe.Calories_Per_Serving ?? '',
    Protein: recipe.Protein ?? '',
    Carbs: recipe.Carbs ?? '',
    Fats: recipe.Fats ?? '',
    Why_It_Fits: recipe.Why_It_Fits || '',
    Gluten_Free: recipe.Gluten_Free || false,
    Vegetarian: recipe.Vegetarian || false,
    Kosher: recipe.Kosher || false,
    Ingredients: (recipe.Ingredients || []).join('\n'),
    Instructions: (recipe.Instructions || []).join('\n'),
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/recipes/user/${userId}/${recipe.Recipe_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Title: form.Title,
          Meal_Type: form.Meal_Type,
          Prep_Time: form.Prep_Time,
          Calories_Per_Serving: Number(form.Calories_Per_Serving),
          Protein: form.Protein !== '' ? Number(form.Protein) : null,
          Carbs: form.Carbs !== '' ? Number(form.Carbs) : null,
          Fats: form.Fats !== '' ? Number(form.Fats) : null,
          Why_It_Fits: form.Why_It_Fits,
          Gluten_Free: form.Gluten_Free,
          Vegetarian: form.Vegetarian,
          Kosher: form.Kosher,
          Ingredients: form.Ingredients,
          Instructions: form.Instructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed.');
      setIsEditing(false);
      onUpdated(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe?')) return;
    try {
      const res = await fetch(`/api/recipes/user/${userId}/${recipe.Recipe_ID}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      onDeleted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div>
    <button type="button" onClick={onBack} style={styles.backBtn}>← Back to recipes</button>
    <div style={styles.recipeCard}>
      <div style={styles.detailActions}>
        {!isEditing ? (
          <>
            <button type="button" onClick={() => setIsEditing(true)} style={styles.editBtn}>Edit</button>
            <button type="button" onClick={handleDelete} style={styles.deleteBtn}>Delete</button>
          </>
        ) : (
          <>
            <button type="button" onClick={handleSave} disabled={saving} style={styles.saveBtn}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
          </>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!isEditing ? (
        <>
          <h2 style={styles.recipeTitle}>{recipe.Recipe_Name || recipe.Title}</h2>
          <p style={styles.meta}>
            {recipe.Meal_Type && <span>{recipe.Meal_Type} · </span>}
            {recipe.Created_At && <span>{formatDate(recipe.Created_At)}</span>}
          </p>
          {recipe.Prep_Time && <p style={styles.prep}>Prep time: {recipe.Prep_Time}</p>}
          <div style={styles.macros}>
            <span>{recipe.Calories ?? recipe.Calories_Per_Serving ?? '—'} kcal</span>
            {recipe.Protein != null && <span>P: {recipe.Protein}g</span>}
            {recipe.Carbs != null && <span>C: {recipe.Carbs}g</span>}
            {recipe.Fats != null && <span>F: {recipe.Fats}g</span>}
          </div>
          <DietTags recipe={recipe} />
          {recipe.Source_Ingredients?.length > 0 && (
            <p style={styles.source}>From your fridge: {recipe.Source_Ingredients.join(', ')}</p>
          )}
          {recipe.Why_It_Fits && <p style={styles.why}>{recipe.Why_It_Fits}</p>}
          <h4>Ingredients</h4>
          <ul>{(recipe.Ingredients || []).map((ing, i) => <li key={i}>{ing}</li>)}</ul>
          <h4>Instructions</h4>
          <ol>{(recipe.Instructions || []).map((step, i) => <li key={i} style={{ marginBottom: 8 }}>{step}</li>)}</ol>
        </>
      ) : (
        <div style={styles.editForm}>
          <label style={styles.editLabel}>Title<input value={form.Title} onChange={(e) => setForm({ ...form, Title: e.target.value })} style={styles.editInput} /></label>
          <label style={styles.editLabel}>Meal<select value={form.Meal_Type} onChange={(e) => setForm({ ...form, Meal_Type: e.target.value })} style={styles.editInput}>{MEAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
          <label style={styles.editLabel}>Prep time<input value={form.Prep_Time} onChange={(e) => setForm({ ...form, Prep_Time: e.target.value })} style={styles.editInput} /></label>
          <label style={styles.editLabel}>Calories<input type="number" value={form.Calories_Per_Serving} onChange={(e) => setForm({ ...form, Calories_Per_Serving: e.target.value })} style={styles.editInput} /></label>
          <label style={styles.editLabel}>Ingredients (one per line)<textarea value={form.Ingredients} onChange={(e) => setForm({ ...form, Ingredients: e.target.value })} style={styles.textarea} rows={4} /></label>
          <label style={styles.editLabel}>Instructions (one per line)<textarea value={form.Instructions} onChange={(e) => setForm({ ...form, Instructions: e.target.value })} style={styles.textarea} rows={4} /></label>
          <div style={styles.row}>
            <label><input type="checkbox" checked={form.Gluten_Free} onChange={(e) => setForm({ ...form, Gluten_Free: e.target.checked })} /> Gluten-free</label>
            <label><input type="checkbox" checked={form.Vegetarian} onChange={(e) => setForm({ ...form, Vegetarian: e.target.checked })} /> Vegetarian</label>
            <label><input type="checkbox" checked={form.Kosher} onChange={(e) => setForm({ ...form, Kosher: e.target.checked })} /> Kosher</label>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

const Recipes = () => {
  const userId = localStorage.getItem('userId');

  const [view, setView] = useState('list');
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const [filterMeal, setFilterMeal] = useState('All');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDietary, setFilterDietary] = useState({ glutenFree: false, vegetarian: false, kosher: false });

  const [mealType, setMealType] = useState('Lunch');
  const [selected, setSelected] = useState([]);
  const [dietary, setDietary] = useState({ glutenFree: false, vegetarian: false, kosher: false });
  const [extraNotes, setExtraNotes] = useState('');
  const [budget, setBudget] = useState(null);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const loadSavedRecipes = useCallback(async () => {
    if (!userId) return;
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (filterMeal !== 'All') params.set('mealType', filterMeal);
      if (filterSearch.trim()) params.set('search', filterSearch.trim());
      if (filterDietary.glutenFree) params.set('glutenFree', '1');
      if (filterDietary.vegetarian) params.set('vegetarian', '1');
      if (filterDietary.kosher) params.set('kosher', '1');

      const qs = params.toString();
      const res = await fetch(`/api/recipes/user/${userId}${qs ? `?${qs}` : ''}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : [];
      setSavedRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setSavedRecipes([]);
    } finally {
      setLoadingList(false);
    }
  }, [userId, filterMeal, filterSearch, filterDietary]);

  const loadBudget = useCallback(async () => {
    if (!userId) return;
    setLoadingBudget(true);
    try {
      const res = await fetch(`/api/recipes/budget/${userId}/${mealType}`);
      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : null;
      if (data && !data.error) setBudget(data);
    } catch (err) {
      console.error('Error loading meal budget:', err);
    } finally {
      setLoadingBudget(false);
    }
  }, [userId, mealType]);

  useEffect(() => {
    if (view === 'list') loadSavedRecipes();
  }, [view, loadSavedRecipes]);

  useEffect(() => {
    if (view === 'create') loadBudget();
  }, [view, loadBudget]);

  const resetCreateForm = () => {
    setMealType('Lunch');
    setSelected([]);
    setDietary({ glutenFree: false, vegetarian: false, kosher: false });
    setExtraNotes('');
    setBudget(null);
    setError('');
  };

  const openCreate = () => {
    resetCreateForm();
    setView('create');
  };

  const toggleIngredient = (name) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleDietary = (key) => {
    setDietary((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFilterDietary = (key) => {
    setFilterDietary((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!userId) {
      setError('Please log in first.');
      return;
    }
    if (selected.length === 0) {
      setError('Select at least one ingredient from your fridge.');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          User_ID: Number(userId),
          Meal_Type: mealType,
          Ingredients: selected,
          Dietary: dietary,
          Extra_Notes: extraNotes,
        }),
      });

      const data = res.headers.get('content-type')?.includes('application/json')
        ? await res.json()
        : {};

      if (!res.ok) throw new Error(data.error || 'Failed to generate recipe.');

      setSelectedRecipe(data);
      setView('detail');
      loadSavedRecipes();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setGenerating(false);
    }
  };

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
  };

  if (!userId) {
    return <div style={styles.page}>Please log in to view and create recipes.</div>;
  }

  if (view === 'detail' && selectedRecipe) {
    return (
      <div style={styles.page}>
        <RecipeDetail
          recipe={selectedRecipe}
          userId={userId}
          onBack={() => {
            setSelectedRecipe(null);
            setView('list');
          }}
          onUpdated={(updated) => {
            setSelectedRecipe(updated);
            loadSavedRecipes();
          }}
          onDeleted={() => {
            setSelectedRecipe(null);
            setView('list');
            loadSavedRecipes();
          }}
        />
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div style={styles.page}>
        <button type="button" onClick={() => setView('list')} style={styles.backBtn}>
          ← Back to saved recipes
        </button>
        <h1 style={styles.heading}>New recipe</h1>
        <p style={styles.subtitle}>
          Pick what you have in the fridge. AI will choose a good combination for this meal — it does not have to use every item you select.
        </p>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Which meal?</h3>
          <div style={styles.row}>
            {MEAL_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                style={{ ...styles.mealBtn, ...(mealType === type ? styles.mealBtnActive : {}) }}
              >
                {type}
              </button>
            ))}
          </div>
          {loadingBudget ? (
            <p style={styles.hint}>Calculating calorie budget…</p>
          ) : budget ? (
            <div style={styles.budgetCard}>
              <strong>{mealType} budget today:</strong> {budget.remaining} kcal remaining
              <span style={styles.budgetDetail}>
                ({budget.consumedForMeal} eaten of {budget.mealBudget} kcal)
              </span>
            </div>
          ) : null}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Dietary preferences</h3>
          <div style={styles.row}>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={dietary.glutenFree} onChange={() => toggleDietary('glutenFree')} />
              Gluten-free
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={dietary.vegetarian} onChange={() => toggleDietary('vegetarian')} />
              Vegetarian
            </label>
            <label style={styles.checkLabel}>
              <input type="checkbox" checked={dietary.kosher} onChange={() => toggleDietary('kosher')} />
              Kosher
            </label>
          </div>
        </div>

        {Object.entries(FRIDGE_CATEGORIES).map(([category, items]) => (
          <div key={category} style={styles.section}>
            <h3 style={styles.sectionTitle}>{category}</h3>
            <div style={styles.chipGrid}>
              {items.map((item) => {
                const isOn = selected.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleIngredient(item)}
                    style={{ ...styles.chip, ...(isOn ? styles.chipActive : {}) }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {selected.length > 0 && (
          <div style={styles.selectedBox}>
            <strong>Selected ({selected.length}):</strong> {selected.join(', ')}
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Extra notes (optional)</h3>
          <textarea
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="e.g. low-fat, quick 15-min meal…"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || selected.length === 0}
          style={{ ...styles.generateBtn, opacity: generating || selected.length === 0 ? 0.6 : 1 }}
        >
          {generating ? 'Creating your recipe…' : 'Generate & save recipe'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.heading}>My recipes</h1>
          <p style={styles.subtitle}>All AI recipes you saved, filtered by meal, diet, or ingredient.</p>
        </div>
        <button type="button" onClick={openCreate} style={styles.newBtn}>
          + New recipe
        </button>
      </div>

      <div style={styles.filters}>
        <select value={filterMeal} onChange={(e) => setFilterMeal(e.target.value)} style={styles.select}>
          <option value="All">All meals</option>
          {MEAL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Search by name or ingredient…"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          style={styles.searchInput}
        />

        <label style={styles.checkLabel}>
          <input type="checkbox" checked={filterDietary.glutenFree} onChange={() => toggleFilterDietary('glutenFree')} />
          Gluten-free
        </label>
        <label style={styles.checkLabel}>
          <input type="checkbox" checked={filterDietary.vegetarian} onChange={() => toggleFilterDietary('vegetarian')} />
          Vegetarian
        </label>
        <label style={styles.checkLabel}>
          <input type="checkbox" checked={filterDietary.kosher} onChange={() => toggleFilterDietary('kosher')} />
          Kosher
        </label>
      </div>

      {loadingList ? (
        <p>Loading recipes…</p>
      ) : savedRecipes.length === 0 ? (
        <div style={styles.empty}>
          <p>No saved recipes yet.</p>
          <button type="button" onClick={openCreate} style={styles.generateBtn}>
            Create your first recipe
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {savedRecipes.map((recipe) => (
            <button
              key={recipe.Recipe_ID}
              type="button"
              onClick={() => openRecipe(recipe)}
              style={styles.listCard}
            >
              <h3 style={styles.listTitle}>{recipe.Recipe_Name || recipe.Title}</h3>
              <p style={styles.listMeta}>
                {recipe.Meal_Type || 'Meal'} · {recipe.Calories ?? recipe.Calories_Per_Serving} kcal
              </p>
              {recipe.Created_At && (
                <p style={styles.listDate}>{formatDate(recipe.Created_At)}</p>
              )}
              <DietTags recipe={recipe} />
              {recipe.Source_Ingredients?.length > 0 && (
                <p style={styles.listSource}>
                  {recipe.Source_Ingredients.slice(0, 4).join(', ')}
                  {recipe.Source_Ingredients.length > 4 ? '…' : ''}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 8, flexWrap: 'wrap' },
  heading: { marginBottom: 4, fontSize: '1.75rem' },
  subtitle: { color: '#555', marginBottom: 16, lineHeight: 1.5 },
  newBtn: {
    padding: '10px 20px',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  backBtn: {
    marginBottom: 16,
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    background: '#f8f9fa',
    borderRadius: 8,
  },
  select: { padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' },
  searchInput: { flex: '1 1 200px', padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', minWidth: 180 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12, fontSize: '1.1rem' },
  row: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  mealBtn: { padding: '8px 16px', border: '1px solid #ccc', borderRadius: 8, background: '#fff', cursor: 'pointer' },
  mealBtnActive: { background: '#007bff', color: '#fff', borderColor: '#007bff' },
  budgetCard: { marginTop: 12, padding: '12px 16px', background: '#e8f4fd', borderRadius: 8, fontSize: '0.95rem' },
  budgetDetail: { display: 'block', color: '#666', fontSize: '0.85rem', marginTop: 4 },
  hint: { color: '#888', marginTop: 8 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { padding: '6px 12px', borderRadius: 20, border: '1px solid #ddd', background: '#f8f9fa', cursor: 'pointer', fontSize: '0.9rem' },
  chipActive: { background: '#28a745', color: '#fff', borderColor: '#28a745' },
  selectedBox: { padding: 12, background: '#f0fff4', borderRadius: 8, marginBottom: 16, fontSize: '0.9rem' },
  textarea: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontFamily: 'inherit', boxSizing: 'border-box' },
  error: { color: '#dc3545', marginBottom: 12 },
  generateBtn: { padding: '12px 24px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 8, fontSize: '1rem', cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '40px 20px', color: '#666' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  listCard: {
    textAlign: 'left',
    padding: 16,
    border: '1px solid #dee2e6',
    borderRadius: 10,
    background: '#fff',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  listTitle: { margin: '0 0 8px', fontSize: '1.05rem' },
  listMeta: { margin: '0 0 4px', color: '#007bff', fontWeight: 600, fontSize: '0.9rem' },
  listDate: { margin: '0 0 8px', color: '#888', fontSize: '0.8rem' },
  listSource: { margin: '8px 0 0', color: '#555', fontSize: '0.85rem' },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { fontSize: '0.75rem', padding: '2px 8px', background: '#e9ecef', borderRadius: 12, color: '#495057' },
  recipeCard: { border: '1px solid #dee2e6', borderRadius: 12, padding: 24, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  recipeTitle: { marginTop: 0 },
  meta: { color: '#666', fontSize: '0.9rem' },
  prep: { color: '#666' },
  macros: { display: 'flex', gap: 16, marginBottom: 12, fontWeight: 600 },
  source: { color: '#555', fontSize: '0.9rem' },
  why: { fontStyle: 'italic', color: '#555', marginBottom: 16 },
  detailActions: { display: 'flex', gap: '8px', marginBottom: '16px' },
  editBtn: { padding: '6px 12px', border: '1px solid #007bff', borderRadius: '6px', background: '#fff', color: '#007bff', cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', border: '1px solid #dc3545', borderRadius: '6px', background: '#fff', color: '#dc3545', cursor: 'pointer' },
  saveBtn: { padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#007bff', color: '#fff', cursor: 'pointer' },
  cancelBtn: { padding: '6px 12px', border: '1px solid #ccc', borderRadius: '6px', background: '#fff', cursor: 'pointer' },
  editForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
  editLabel: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' },
  editInput: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc' },
};

export default Recipes;
