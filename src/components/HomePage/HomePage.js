import React from 'react';

const HomePage = () => {
  const themeStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#333',
  };

  const articles = [
    {
      title: 'Як інновації змінюють світ: надихаючі історії успіху',
      content: 'Ідеї, які колись здавались божевільними, сьогодні формують наше майбутнє.',
    },
    {
      title: 'Наука про проблеми: як виявлення проблем може призвести до інновацій',
      content: 'Багато відкриттів були зроблені завдяки тому, що хтось побачив проблему.',
    },
    {
      title: 'Мислення поза рамками: чому важливо ділитися ідеями',
      content: 'Дослідження показують, що ідеї, висловлені вчасно, можуть мати потужний вплив.',
    },
  ];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f4f8',
    }}>
      <div style={{ ...themeStyles, flex: 1, padding: '20px', overflow: 'auto' }}>
        <section style={{
          textAlign: 'center',
          padding: '40px',
          color: '#004085',
        }}>
          <h1 style={{ fontSize: '2.5em', fontWeight: 'bold' }}>Ваша думка має значення!</h1>
          <p style={{ fontSize: '1.2em', lineHeight: '1.6', maxWidth: '700px', margin: '20px auto' }}>
            Avtologistika — це платформа, створена для вас і заради вас. Діліться своїми думками та допомагайте нам ставати кращими!
          </p>
        </section>

        <section style={{
          backgroundColor: 'rgba(240, 244, 248, 0.9)',
          padding: '40px',
          width: '100%',
          textAlign: 'center',
          borderRadius: '8px',
          marginTop: '20px',
        }}>
          <h2 style={{ fontSize: '2em', fontWeight: 'bold', color: '#004085' }}>Цікаві Статті</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            {articles.map((article, index) => (
              <div key={index} style={{
                backgroundColor: '#ffffff',
                color: '#333',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                width: '300px',
                textAlign: 'left',
              }}>
                <h3 style={{ fontSize: '1.5em', marginBottom: '10px' }}>{article.title}</h3>
                <p style={{ fontSize: '1em', lineHeight: '1.6' }}>{article.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
