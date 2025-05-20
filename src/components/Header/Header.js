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
    setUserName(null);
    navigate('/');
  }, [navigate]);

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Не вдалося отримати профіль');
      const data = await res.json();
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
      setUserName(fullName || null);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    token ? fetchUserProfile(token) : setIsLoaded(true);
  }, [fetchUserProfile]);

  if (!isLoaded) return null;

  return (
    <header style={headerStyle}>
      <span style={titleStyle} onClick={() => navigate('/')}>Avtologistika</span>
      <div style={navStyle}>
        {userName ? (
          <>
            <span style={linkStyle} onClick={() => navigate('/worker')}>{userName}</span>
            <span style={linkStyle} onClick={handleLogout}>Вийти</span>
          </>
        ) : (
          <>
            <span style={linkStyle} onClick={() => navigate('/login')}>Вхід</span>
            <span style={linkStyle} onClick={() => navigate('/register')}>Реєстрація</span>
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
  height: '44px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 24px',
  backdropFilter: 'blur(12px)',
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  zIndex: 1000
};

const titleStyle = {
  fontSize: '14px',
  fontWeight: 400,
  cursor: 'pointer',
  userSelect: 'none'
};

const navStyle = {
  display: 'flex',
  gap: '16px',
  fontSize: '13px'
};

const linkStyle = {
  cursor: 'pointer',
  textDecoration: 'none',
  fontWeight: 400
};

export default Header;
