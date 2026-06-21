/**
 * AUTH STYLES — Shared look for login/register forms (colors, spacing, inputs).
 */
export const authStyles = {
  container: {
    maxWidth: '420px',
    margin: '40px auto',
    padding: '28px',
    border: '1px solid #e2e8f0',
    borderRadius: '14px',
    fontFamily: 'system-ui, sans-serif',
    background: '#fff',
  },
  title: { margin: '0 0 4px', fontSize: '1.5rem', color: '#1a1a2e' },
  subtitle: { margin: '0 0 16px', color: '#64748b', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', fontSize: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' },
  button: {
    padding: '12px',
    fontSize: '15px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    marginTop: '4px',
  },
  googleWrap: { display: 'flex', justifyContent: 'center', marginBottom: '8px' },
  separator: { display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' },
  separatorLine: { flex: 1, height: '1px', background: '#e2e8f0' },
  separatorText: { color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' },
  success: { color: '#166534', fontSize: '0.9rem', marginTop: '12px', textAlign: 'center' },
  error: { color: '#b91c1c', fontSize: '0.9rem', marginTop: '12px', textAlign: 'center' },
  footer: { marginTop: '16px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' },
  link: { color: '#6366f1', fontWeight: 600, textDecoration: 'none' },
  hint: { fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' },
};
