import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'https://backend-avtologistika.onrender.com/api/userRoutes';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) handleLogout();
        else throw new Error('Помилка завантаження профілю');
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
        {userName ? (
          <>
            <span style={nameStyle} onClick={() => navigate('/worker')}>{userName}</span>
            <button style={buttonStyle} onClick={handleLogout}>Вийти</button>
          </>
        ) : (
          <>
            <button style={buttonStyle} onClick={() => navigate('/login')}>Вхід</button>
            <button style={buttonStyle} onClick={() => navigate('/register')}>Реєстрація</button>
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
  zIndex: 999,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '48px',
  padding: '0 24px',
  backdropFilter: 'blur(14px)',
  backgroundColor: 'rgba(255,255,255,0)', // повна прозорість
  boxShadow: 'none',
  borderBottom: 'none'
};

const leftStyle = {
  fontWeight: 500,
  fontSize: '15px',
  cursor: 'pointer',
  userSelect: 'none'
};

const rightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const nameStyle = {
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 400,
  textDecoration: 'underline'
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  padding: '6px 12px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 400,
  textDecoration: 'underline'
};

export default Header;
