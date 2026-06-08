import React, { useState } from 'react';

function MealScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Pour stocker les calories

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      setLoading(true);

      try {
        const response = await fetch('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            User_ID: 1, 
            Meal_Type: 'Lunch',
            Image_Base64: base64Image 
          }),
        });

        const data = await response.json();
        // C'est ici qu'on récupère la réponse du serveur
        setResult(data.analysis); 
      } catch (error) {
        console.error("Erreur :", error);
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Scanner mon plat</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      {loading && <p>Analyse en cours...</p>}
      
      {/* Affichage du résultat si on en a un */}
      {result && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
          <h3>Résultat de l'analyse :</h3>
          <p>Calories : {result.Total_Calories} kcal</p>
          <p>Protéines : {result.Protein_Grams}g</p>
          <p>Glucides : {result.Carbs_Grams}g</p>
          <p>Lipides : {result.Fats_Grams}g</p>
        </div>
      )}
    </div>
  );
}

export default MealScanner;