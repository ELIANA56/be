/**
 * AUTH CARD — Shared white box layout for Login and Register pages.
 */
import React from 'react';
import { authStyles as styles } from './authStyles';

const AuthCard = ({ title, subtitle, children }) => (
  <div style={styles.container}>
    <h2 style={styles.title}>{title}</h2>
    <p style={styles.subtitle}>{subtitle}</p>
    {children}
  </div>
);

export default AuthCard;
