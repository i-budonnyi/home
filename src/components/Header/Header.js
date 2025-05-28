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

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setTheme(currentTheme);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  const textColor = theme === 'dark' ? '#ffffff' : '#000000';

  if (!isLoaded) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@700&display=swap" rel="stylesheet" />
      <header style={{ ...headerStyle, color: textColor }}>
        <div
          style={{ ...leftStyle, color: textColor, fontFamily: 'Roboto Slab, serif' }}
          onClick={() => navigate('/')}
          className="logo-text"
        >
          Avtologistika
        </div>
        <div style={rightStyle}>
          {userName ? (
            <>
              <span style={{ ...nameStyle, color: textColor }} onClick={() => navigate('/worker')}>
                {userName}
              </span>
              <button style={{ ...linkStyle, color: textColor }} onClick={handleLogout}>Вийти</button>
            </>
          ) : (
            <>
              <button style={{ ...linkStyle, color: textColor }} onClick={() => navigate('/login')}>Вхід</button>
              <button style={{ ...linkStyle, color: textColor }} onClick={() => navigate('/register')}>Реєстрація</button>
            </>
          )}
        </div>
      </header>
      <style>
        {`
          .logo-text {
            animation: fadeInLogo 1s ease-in-out;
            font-weight: bold;
            font-size: 20px;
          }

          @keyframes fadeInLogo {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
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
  transition: 'color 0.3s ease',
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

const linkStyle = {
  background: 'none',
  border: 'none',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export default Header;
