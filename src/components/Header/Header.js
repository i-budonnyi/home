import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName(null);
    navigate('/');
  }, [navigate]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
        } else {
          throw new Error('Не вдалося отримати профіль користувача');
        }
      }

      const data = await response.json();
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      setUserName(fullName || null);
    } catch (error) {
      console.error('[ERROR] Помилка отримання профілю:', error.message);
      localStorage.removeItem('token');
    } finally {
      setIsLoaded(true);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoaded(true);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme');
    setIsDarkMode(currentTheme === 'dark');
  }, [location.pathname]); // 🔁 перевірка теми при зміні маршруту

  if (!isLoaded) return null;

  return (
    <header
      style={{
        height: '36px',
        backgroundColor: isDarkMode ? '#1A1A1A' : '#003366',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        fontSize: '13px',
      }}
    >
      <div
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        Avtologistika
      </div>

      <nav>
        {userName ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              onClick={() => navigate('/worker')}
              style={{
                marginRight: '10px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              style={{
                color: 'white',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: '1',
              }}
            >
              Вийти
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                color: 'white',
                backgroundColor: '#28a745',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                cursor: 'pointer',
                marginRight: '6px',
                fontSize: '12px',
                lineHeight: '1',
              }}
            >
              Вхід
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                color: 'white',
                backgroundColor: '#17a2b8',
                border: 'none',
                borderRadius: '3px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontSize: '12px',
                lineHeight: '1',
              }}
            >
              Реєстрація
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
