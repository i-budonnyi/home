import React, { useState } from 'react';
import axios from 'axios';

// 🔧 Заміни на свій API-ендпоінт, якщо потрібно
const API_URL = 'https://backend-avtologistika.onrender.com/api/agenda';

const CreateAgenda = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !meetingDate) {
      alert('❌ Усі поля є обов’язковими.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_URL, {
        title,
        description,
        meeting_date: meetingDate,
        created_by: 1, // 🔧 При потребі заміни на дані з токена
      });
      alert('✅ Порядок денний успішно створено.');
      setTitle('');
      setDescription('');
      setMeetingDate('');
    } catch (error) {
      console.error('❌ Помилка створення порядку денного:', error.message);
      alert('❌ Не вдалося створити порядок денний.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Створити порядок денний</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Назва:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Опис:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Дата зустрічі:</label>
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Створення...' : 'Створити'}
        </button>
      </form>
    </div>
  );
};

export default CreateAgenda;
