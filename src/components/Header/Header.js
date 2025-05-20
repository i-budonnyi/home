import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        else throw new Error('Помилка профілю');
      }

      const data = await response.json();
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      setUserName(fullName || null);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setIsLoaded(true);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserProfile(token);
    else setIsLoaded(true);
  }, [fetchUserProfile]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = localStorage.getItem('theme');
      setIsDarkMode(currentTheme === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  if (!isLoaded) return null;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: '48px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      backgroundColor: 'transparent',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: isDarkMode ? '#fff' : '#1C1C1C',
    }}>
      <div style={{ fontSize: '16px', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/')}>
        Avtologistika
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {userName ? (
          <>
            <span
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                color: isDarkMode ? '#fff' : '#1C1C1C'
              }}
              onClick={() => navigate('/worker')}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                textDecoration: 'underline',
                cursor: 'pointer',
                color: isDarkMode ? '#fff' : '#1C1C1C'
              }}
            >
              Вийти
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                textDecoration: 'underline',
                cursor: 'pointer',
                color: isDarkMode ? '#fff' : '#1C1C1C'
              }}
            >
              Вхід
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                textDecoration: 'underline',
                cursor: 'pointer',
                color: isDarkMode ? '#fff' : '#1C1C1C'
              }}
            >
              Реєстрація
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
