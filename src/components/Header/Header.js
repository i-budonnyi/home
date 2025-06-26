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

  if (!isLoaded) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@700&display=swap" rel="stylesheet" />

      {/* LED Смуга зверху */}
      <div className="led-strip" />

      <header style={headerStyle}>
        <div
          style={{ ...leftStyle, fontFamily: 'Roboto Slab, serif' }}
          onClick={() => navigate('/')}
          className="led-glow"
        >
          Avtologistika
        </div>
        <div style={rightStyle}>
          {userName ? (
            <>
              <span className="led-glow" style={nameStyle} onClick={() => navigate('/worker')}>
                {userName}
              </span>
              <button className="led-glow" style={linkStyle} onClick={handleLogout}>Вийти</button>
            </>
          ) : (
            <>
              <button className="led-glow" style={linkStyle} onClick={() => navigate('/login')}>Вхід</button>
              <button className="led-glow" style={linkStyle} onClick={() => navigate('/register')}>Реєстрація</button>
            </>
          )}
        </div>
      </header>

      <style>
        {`
          .led-strip {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #00f0ff, #0078ff);
            box-shadow:
              0 0 8px rgba(0, 224, 255, 0.8),
              0 0 16px rgba(0, 120, 255, 0.5),
              0 0 24px rgba(0, 120, 255, 0.3);
            z-index: 9999;
            animation: steadyGlow 2s ease-in-out infinite alternate;
            pointer-events: none;
          }

          @keyframes steadyGlow {
            from { opacity: 0.85; }
            to { opacity: 1; }
          }

          .led-glow {
            position: relative;
            color: #ffffff;
            text-shadow:
              0 0 6px #00f0ff,
              0 0 12px #00c4ff,
              0 0 20px #008cff,
              0 0 32px rgba(0, 136, 255, 0.6);
            filter: drop-shadow(0 0 6px #00e0ff);
          }

          @media (prefers-color-scheme: light) {
            .led-glow {
              color: #000000;
            }
          }
        `}
      </style>
    </>
  );
};

const headerStyle = {
  position: 'fixed',
  top: 4,
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
};

const leftStyle = {
  fontSize: '18px',
  fontWeight: 600,
  cursor: 'pointer',
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const nameStyle = {
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '14px',
  background: 'none',
  border: 'none',
};

const linkStyle = {
  background: 'none',
  border: 'none',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
};

export default Header;
