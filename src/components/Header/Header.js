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

  if (!isLoaded) return null;

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 1000,
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Avtologistika
      </div>

      <nav>
        {userName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span onClick={() => navigate('/worker')} style={{ cursor: 'pointer' }}>
              {userName}
            </span>
            <span onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Вийти
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
              Вхід
            </span>
            <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
              Реєстрація
            </span>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
