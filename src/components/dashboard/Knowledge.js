import React, { useEffect, useState } from 'react';

const Knowledge = () => {
  const [data, setData] = useState({ currentWeek: 1, featured: null, articles: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/articles/weekly');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load articles.');
        setData(json);
        setSelected(json.featured || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={styles.page}>Loading articles...</div>;
  if (error) return <div style={styles.page}><p style={styles.error}>{error}</p></div>;

  const { currentWeek, featured, articles } = data;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Knowledge Center</h1>
      <p style={styles.subtitle}>
        A new health article unlocks every week. You are on week {currentWeek} of 52.
      </p>

      {featured && (
        <section style={styles.featuredCard}>
          <span style={styles.badge}>This week&apos;s article</span>
          <h2 style={styles.featuredTitle}>{featured.Title}</h2>
          <p style={styles.meta}>
            Week {featured.Week_Number} · {featured.Category}
          </p>
          <p style={styles.summary}>{featured.Summary}</p>
          <p style={styles.content}>{featured.Content}</p>
        </section>
      )}

      <section style={styles.listSection}>
        <h3 style={styles.listTitle}>All available articles</h3>
        <div style={styles.grid}>
          {articles.map((article) => {
            const isActive = selected?.Article_ID === article.Article_ID;
            const isCurrent = article.Week_Number === currentWeek;
            return (
              <button
                key={article.Article_ID}
                type="button"
                onClick={() => setSelected(article)}
                style={{
                  ...styles.card,
                  ...(isActive ? styles.cardActive : {}),
                }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.week}>Week {article.Week_Number}</span>
                  {isCurrent && <span style={styles.newBadge}>New</span>}
                </div>
                <h4 style={styles.cardTitle}>{article.Title}</h4>
                <p style={styles.cardCategory}>{article.Category}</p>
                <p style={styles.cardSummary}>{article.Summary}</p>
              </button>
            );
          })}
        </div>
      </section>

      {selected && selected.Article_ID !== featured?.Article_ID && (
        <section style={styles.reader}>
          <h3 style={styles.readerTitle}>{selected.Title}</h3>
          <p style={styles.meta}>Week {selected.Week_Number} · {selected.Category}</p>
          <p style={styles.content}>{selected.Content}</p>
        </section>
      )}
    </div>
  );
};

const styles = {
  page: { maxWidth: '960px' },
  heading: { margin: '0 0 8px', fontSize: '1.75rem', color: '#1a1a2e' },
  subtitle: { margin: '0 0 24px', color: '#64748b' },
  featuredCard: {
    background: 'linear-gradient(135deg, #ecfdf5, #f0f9ff)',
    border: '1px solid #bbf7d0',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-block',
    background: '#16a34a',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: '999px',
    marginBottom: '12px',
  },
  featuredTitle: { margin: '0 0 8px', fontSize: '1.5rem', color: '#14532d' },
  meta: { margin: '0 0 12px', color: '#64748b', fontSize: '0.9rem' },
  summary: { margin: '0 0 12px', color: '#334155', fontWeight: 500 },
  content: { margin: 0, color: '#475569', lineHeight: 1.7 },
  listSection: { marginTop: '8px' },
  listTitle: { margin: '0 0 16px', fontSize: '1.1rem', color: '#334155' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
  },
  card: {
    textAlign: 'left',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '16px',
    cursor: 'pointer',
  },
  cardActive: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 2px rgba(99,102,241,0.15)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  week: { fontSize: '0.8rem', fontWeight: 600, color: '#6366f1' },
  newBadge: {
    fontSize: '0.7rem',
    background: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: 700,
  },
  cardTitle: { margin: '0 0 6px', fontSize: '1rem', color: '#1e293b' },
  cardCategory: { margin: '0 0 8px', fontSize: '0.8rem', color: '#94a3b8' },
  cardSummary: { margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 },
  reader: {
    marginTop: '24px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    padding: '20px',
  },
  readerTitle: { margin: '0 0 8px', color: '#1e293b' },
  error: { color: '#b91c1c' },
};

export default Knowledge;
