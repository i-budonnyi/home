import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Treasurer = () => {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  // ✅ Виправлений Базовий URL для API
  const API_URL = 'https://idea-backend.onrender.com/api';

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments`);
      setPayments(response.data);
    } catch (error) {
      console.error('❌ Помилка отримання платежів:', error);
    }
  };

  const addPayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/payments`, form);
      alert('✅ Платіж успішно додано!');
      setForm({ first_name: '', last_name: '', phone: '', email: '' });
      fetchPayments(); // Оновити список після додавання
    } catch (error) {
      console.error('❌ Помилка додавання платежу:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Панель Казначея</h1>

      {/* Форма для додавання платежу */}
      <form onSubmit={addPayment} style={{ marginBottom: '20px' }}>
        <h2>Додати платіж</h2>
        <input
          type="text"
          name="first_name"
          placeholder="Ім'я"
          value={form.first_name}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Прізвище"
          value={form.last_name}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Додати
        </button>
      </form>

      {/* Таблиця з платежами */}
      <h2>Список Платежів</h2>
      <table border="1" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Прізвище</th>
            <th>Телефон</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <tr key={index}>
                <td>{payment.first_name}</td>
                <td>{payment.last_name}</td>
                <td>{payment.phone}</td>
                <td>{payment.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>
                Немає записів
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Treasurer;
