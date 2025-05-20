// ✅ EditProfilePage.jsx — фронтенд React

import React, { useState, useEffect } from 'react';

const EditProfilePage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = `${process.env.REACT_APP_API_BASE_URL}/api/self/profile`;
    console.log("🔗 GET:", url);

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setFirstName(data.name || '');
        setLastName(data.surname || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
      })
      .catch(err => {
        console.error('❌ Помилка завантаження профілю:', err);
        setError('Не вдалося завантажити профіль.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Необхідно увійти.');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/self/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: firstName,
          surname: lastName,
          email,
          phone,
          password: password || undefined
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuccess(true);
    } catch (err) {
      console.error("❌ Помилка оновлення:", err);
      setError('Не вдалося оновити профіль.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem', background: '#fff', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Редагувати профіль</h2>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>Профіль оновлено.</p>}

        <label>Імʼя:</label>
        <input value={firstName} onChange={e => setFirstName(e.target.value)} required style={inputStyle} />

        <label>Прізвище:</label>
        <input value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />

        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />

        <label>Телефон:</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />

        <label>Новий пароль (не обовʼязково):</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

        <button type="submit" style={{ ...inputStyle, background: '#007bff', color: '#fff', cursor: 'pointer' }}>
          Зберегти зміни
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

export default EditProfilePage;
