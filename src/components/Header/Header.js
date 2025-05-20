import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName(null);
    navigate('/');
  }, [navigate]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
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

  // Реагуємо на зміну атрибуту data-theme
  useEffect(() => {
    const updateTheme = () => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(newTheme);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const textColor = theme === 'dark' ? '#ffffff' : '#000000';

  if (!isLoaded) return null;

  return (
    <header style={{ ...headerStyle, color: textColor }}>
      <div style={{ ...leftStyle, color: textColor }} onClick={() => navigate('/')}>
        Avtologistika
      </div>
      <div style={rightStyle}>
        {userName ? (
          <>
            <span style={{ ...nameStyle, color: textColor }} onClick={() => navigate('/worker')}>
              {userName}
            </span>
            <button style={{ ...linkStyle, color: textColor }} onClick={handleLogout}>
              Вийти
            </button>
          </>
        ) : (
          <>
            <button style={{ ...linkStyle, color: textColor }} onClick={() => navigate('/login')}>Вхід</button>
            <button style={{ ...linkStyle, color: textColor }} onClick={() => navigate('/register')}>Реєстрація</button>
          </>
        )}
      </div>
    </header>
  );
};

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  height: '46px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
  backgroundColor: 'transparent',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition: 'color 0.2s ease'
};

const leftStyle = {
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer'
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const nameStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '14px'
};

const linkStyle = {
  background: 'none',
  border: 'none',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer'
};

export default Header;
