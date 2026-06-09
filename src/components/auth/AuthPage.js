import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ Email: '', Password: '', Full_Name: '', Age: 25, Weight: 70, Height: 170, Gender: 'Male', Goal_Type: 'Weight Loss' });
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const cred = isLogin 
        ? await signInWithEmailAndPassword(auth, formData.Email, formData.Password)
        : await createUserWithEmailAndPassword(auth, formData.Email, formData.Password);
      
      const idToken = await cred.user.getIdToken();
      
      // אם זו הרשמה - שלחי גם את פרטי המשתמש ל-MySQL
      if (!isLogin) {
        await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, uid: cred.user.uid })
        });
      }

      // התחברות לשרת (שליפת נתונים)
      const res = await fetch('http://localhost:3001/api/auth/login', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      navigate('/home');
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{isLogin ? 'התחברות' : 'הרשמה'}</h2>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="אימייל" onChange={(e) => setFormData({...formData, Email: e.target.value})} />
        <input type="password" placeholder="סיסמה" onChange={(e) => setFormData({...formData, Password: e.target.value})} />
        <button type="submit">{isLogin ? 'התחבר' : 'הירשם'}</button>
      </form>
    </div>
  );
};
export default AuthPage;