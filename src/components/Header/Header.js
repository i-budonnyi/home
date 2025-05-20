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
        if (response.status === 401) handleLogout();
        else throw new Error('Не вдалося отримати профіль користувача');
      }

      const data = await response.json();
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      setUserName(fullName || null);
    } catch (error) {
      console.error('[HEADER] ❌ Помилка профілю:', error.message);
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
    const theme = localStorage.getItem('theme');
    setIsDarkMode(theme === 'dark');
  }, [location.pathname]);

  if (!isLoaded) return null;

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backdropFilter: 'blur(12px)',
    backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
    color: isDarkMode ? '#fff' : '#000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '48px',
    padding: '0 24px',
    fontSize: '14px',
    borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
    boxShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
  };

  const buttonStyle = {
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: '0.2s',
    backdropFilter: 'blur(4px)',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    color: isDarkMode ? '#fff' : '#000',
    marginLeft: 10
  };

  return (
    <header style={headerStyle}>
      <div
        onClick={() => navigate('/')}
        style={{ fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
      >
        Avtologistika
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {userName ? (
          <>
            <span
              onClick={() => navigate('/worker')}
              style={{
                marginRight: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 500,
              }}
            >
              {userName}
            </span>
            <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#e74c3c', color: '#fff' }}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={buttonStyle}>
              Вхід
            </button>
            <button onClick={() => navigate('/register')} style={buttonStyle}>
              Реєстрація
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
