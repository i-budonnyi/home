import React, { useState } from 'react';
import axios from 'axios';

// ✅ Твій бекенд для оновлення профілю
const API_PROFILE_UPDATE_URL = "https://idea-backend.onrender.com/api/userRoutes/update-profile";

const ProfileSettingsPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Ви не авторизовані.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        API_PROFILE_UPDATE_URL,
        { username, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('✅ Профіль успішно оновлено!');
      } else {
        alert('⚠️ Сталася невідома помилка.');
      }
    } catch (error) {
      console.error('❌ Помилка оновлення профілю:', error);
      alert('❌ Помилка при оновленні профілю.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Налаштування Профілю</h2>
      <p>Тут ви можете змінити налаштування свого профілю.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username">Ім'я користувача</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Електронна пошта</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px', // 🔥 ВИПРАВИЛА borderRadius
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Оновлюємо...' : 'Зберегти зміни'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
