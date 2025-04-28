import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  if (!isLoaded) {
    return null;
  }

  return (
    <header
      style={{
        padding: '15px 20px',
        backgroundColor: '#003366',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <h1
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          margin: 0,
          fontSize: '24px',
        }}
      >
        Avtologistika
      </h1>
      <nav>
        {userName ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              onClick={() => navigate('/worker')}
              style={{
                marginRight: '15px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 'bold',
              }}
            >
              Привіт, {userName}!
            </span>
            <button
              onClick={handleLogout}
              style={{
                color: 'white',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Вихід
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
                borderRadius: '5px',
                padding: '8px 12px',
                cursor: 'pointer',
                marginRight: '10px',
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
                borderRadius: '5px',
                padding: '8px 12px',
                cursor: 'pointer',
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
