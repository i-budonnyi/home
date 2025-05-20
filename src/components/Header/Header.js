import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserName(null);
    navigate('/');
  }, [navigate]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
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
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    setIsDarkMode(!isDarkMode);
  };

  if (!isLoaded) return null;

  return (
    <header style={{
      ...headerStyle,
      color: isDarkMode ? '#f0f0f0' : '#1a1a1a',
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
    }}>
      <div style={leftBlock}>
        <span onClick={() => navigate('/')} style={brandStyle}>Avtologistika</span>
      </div>

      <div style={rightStyle}>
        <button onClick={toggleTheme} style={themeBtnStyle} title="Змінити тему">
          {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
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
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
};

const leftBlock = {
  display: 'flex',
  alignItems: 'center',
};

const brandStyle = {
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

const linkStyle = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
};

const themeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'inherit',
  fontSize: '18px',
  cursor: 'pointer',
  marginTop: '1px',
};

export default Header;
