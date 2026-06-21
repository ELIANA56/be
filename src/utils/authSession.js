/**
 * AUTH SESSION — Keeps the user logged in between page refreshes.
 *
 * After login/register, we save token + userId in localStorage.
 * Other pages read userId from there to know who is logged in.
 */

/** Save login data to browser storage */
export function saveAuthSession({ token, userId }) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', String(userId));
}

/** Remove login data (used on logout or account delete) */
export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
}

/** Send Google credential to our server and return token + userId */
export async function loginWithGoogle(credential) {
  const response = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || 'Server error during Google sign-in.');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Google sign-in failed.');
  return data;
}
