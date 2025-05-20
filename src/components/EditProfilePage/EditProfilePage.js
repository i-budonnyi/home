import React, { useState, useEffect } from 'react';

const API_BASE_URL = "https://backend-avtologistika.onrender.com";

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
    if (!token) {
      setError('Немає токена');
      return;
    }

    fetch(`${API_BASE_URL}/api/self/profile`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(user => {
        setFirstName(user.first_name || user.name || '');
        setLastName(user.last_name || user.surname || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      })
      .catch(() => {
        setError('Не вдалося завантажити профіль.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Немає токена');
      return;
    }

    const payload = {
      name: firstName,
      surname: lastName,
      email,
      phone,
      password: password || undefined,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/self/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
      setSuccess(true);
    } catch {
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
