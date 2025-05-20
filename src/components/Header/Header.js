import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

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

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsDarkMode(!isDarkMode);
  };

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

  if (!isLoaded) return null;

  return (
    <header style={headerStyle}>
      <div style={leftStyle} onClick={() => navigate('/')}>Avtologistika</div>
      <div style={rightStyle}>
        <button onClick={toggleTheme} style={iconButtonStyle} aria-label="Toggle Theme">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {userName ? (
          <>
            <span style={nameStyle} onClick={() => navigate('/worker')}>{userName}</span>
            <button style={linkStyle} onClick={handleLogout}>Вийти</button>
          </>
        ) : (
          <>
            <button style={linkStyle} onClick={() => navigate('/login')}>Вхід</button>
            <button style={linkStyle} onClick={() => navigate('/register')}>Реєстрація</button>
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
  height: '48px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
  backgroundColor: 'transparent',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  color: 'inherit',
};

const leftStyle = {
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const nameStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '14px',
};
// тимчасова зміна для пушу
const linkStyle = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
};

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  color: 'inherit',
};

export default Header;
