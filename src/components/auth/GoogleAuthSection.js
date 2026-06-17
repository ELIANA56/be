import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { authStyles as styles } from './authStyles';

export function AuthSeparator({ text }) {
  return (
    <div style={styles.separator}>
      <span style={styles.separatorLine} />
      <span style={styles.separatorText}>{text}</span>
      <span style={styles.separatorLine} />
    </div>
  );
}

const GoogleAuthSection = ({ enabled, mode, onSuccess, onError }) => {
  if (!enabled) {
    return (
      <p style={styles.hint}>
        Google sign-in is not configured. Add REACT_APP_GOOGLE_CLIENT_ID to .env and restart the app.
      </p>
    );
  }

  return (
    <div style={styles.googleWrap}>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        theme="outline"
        size="large"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        width="320"
      />
    </div>
  );
};

export default GoogleAuthSection;
