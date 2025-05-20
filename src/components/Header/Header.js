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
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      backgroundColor: 'transparent',
      color: getComputedStyle(document.documentElement).getPropertyValue('--text-color') || '#000',
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
        color: 'inherit',
      }} onClick={() => navigate('/')}>
        Avtologistika
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}>
        {userName ? (
          <>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: '14px', color: 'inherit' }}
              onClick={() => navigate('/worker')}
            >
              {userName}
            </span>
            <button
              onClick={handleLogout}
              style={linkStyle}
            >
              Вийти
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} style={linkStyle}>Вхід</button>
            <button onClick={() => navigate('/register')} style={linkStyle}>Реєстрація</button>
          </>
        )}
      </div>
    </header>
  );
};

const linkStyle = {
  background: 'none',
  border: 'none',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
  color: 'inherit',
};

export default Header;
