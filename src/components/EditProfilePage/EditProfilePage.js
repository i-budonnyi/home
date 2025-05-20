import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log('🌍 API_BASE_URL:', API_BASE_URL); // лог глобально

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
    console.log('🔐 Token from localStorage:', token);

    if (!token || !API_BASE_URL) {
      console.error('❌ ERROR: Missing token or API_BASE_URL');
      setError('Немає токена або API-адреси');
      return;
    }

    console.log('📤 Sending GET request to:', `${API_BASE_URL}/api/self/profile`);

    fetch(`${API_BASE_URL}/api/self/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        console.log('📥 GET Response status:', res.status);
        if (!res.ok) throw new Error(`GET failed: HTTP ${res.status}`);
        return res.json();
      })
      .then(user => {
        console.log('✅ GET success:', user);
        setFirstName(user.name || '');
        setLastName(user.surname || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      })
      .catch(err => {
        console.error('❌ GET profile error:', err);
        setError('Не вдалося завантажити профіль.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const token = localStorage.getItem('token');
    console.log('🔐 Token on submit:', token);

    if (!token || !API_BASE_URL) {
      console.error('❌ ERROR: Missing token or API_BASE_URL');
      setError('Немає токена або API-адреси');
      return;
    }

    const payload = {
      name: firstName,
      surname: lastName,
      email,
      phone,
      password: password || undefined
    };
    console.log('📤 PATCH payload:', payload);

    try {
      const res = await fetch(`${API_BASE_URL}/api/self/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 PATCH Response status:', res.status);
      if (!res.ok) throw new Error(`PATCH failed: HTTP ${res.status}`);
      const result = await res.json();
      console.log('✅ PATCH success:', result);
      setSuccess(true);
    } catch (err) {
      console.error('❌ PATCH error:', err);
      setError('Не вдалося оновити профіль.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '2rem', background: '#fff', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Редагувати профіль</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center', fontWeight: 'bold' }}>Профіль оновлено.</p>}

      <form onSubmit={handleSubmit}>
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
