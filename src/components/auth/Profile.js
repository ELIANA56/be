import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from "firebase/firestore"; // פונקציות לעבודה עם Firestore
import { db, auth } from "./firebaseConfig"; // הייבוא של ה-db וה-auth מהקובץ שהגדרת

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // שליפת הנתונים מ-Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid); // ה-UID של המשתמש הוא ה-ID של המסמך
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // שמירת השינויים ב-Firestore
  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        Weight: user.Weight,
        Height: user.Height,
        Goal_Type: user.Goal_Type
      });
      alert("הפרופיל עודכן בהצלחה!");
      setIsEditing(false);
    } catch (error) {
      console.error("שגיאה בעדכון:", error);
    }
  };

  if (!user) return <p>טוען נתונים...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.avatar}>{user.Full_Name?.charAt(0) || '?'}</div>
      <h1>{user.Full_Name}</h1>
      
      <div style={styles.card}>
        <p>גיל : {user.Age} שנים</p>
        
        <label>משקל (kg) : </label>
        <input name="Weight" value={user.Weight} onChange={handleChange} disabled={!isEditing} style={styles.input} />
        
        <label>גובה (cm) : </label>
        <input name="Height" value={user.Height} onChange={handleChange} disabled={!isEditing} style={styles.input} />
        
        <label>יעד : </label>
        <input name="Goal_Type" value={user.Goal_Type} onChange={handleChange} disabled={!isEditing} style={styles.input} />
      </div>

      <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.button}>
        {isEditing ? "שמור" : "ערוך"}
      </button>
    </div>
  );
};