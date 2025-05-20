import React, { useState, useEffect } from 'react';

const EditProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // ... інші поля профілю, за потреби
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Отримати поточний профіль при завантаженні компонента
    const token = localStorage.getItem('token'); // отримуємо токен, збережений при авторизації
    if (!token) {
      return; // Можна перенаправити на логін або обробити відсутність токена
    }
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/self/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        // заповнюємо стан початковими значеннями профілю
        setName(data.name);
        setEmail(data.email);
        // ... встановити інші поля
      })
      .catch(errStatus => {
        console.error('Failed to load profile, status:', errStatus);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Необхідно увійти в систему.');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/self/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email /*, ...інші поля*/ })
      });
      if (!response.ok) {
        // Якщо статус не OK, викидаємо помилку з текстом статусу
        throw new Error(`HTTP ${response.status}`);
      }
      // Припустимо, сервер повертає оновлені дані користувача:
      const updatedUser = await response.json();
      console.log('Profile updated:', updatedUser);
      setSuccess(true);
    } catch (err) {
      console.error('Update failed:', err);
      // Встановлюємо зрозуміле повідомлення про помилку для користувача
      setError('Не вдалося оновити профіль. Спробуйте ще раз або пізніше.');
    }
  };

  return (
    <div>
      <h2>Редагувати профіль</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Профіль успішно оновлено.</p>}
        <div>
          <label htmlFor="name">Імʼя:</label><br />
          <input 
            id="name"
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label><br />
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        {/* При необхідності додайте поля для інших даних профілю */}
        <button type="submit">Зберегти зміни</button>
      </form>
    </div>
  );
};

export default EditProfilePage;
