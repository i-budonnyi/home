import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.116:5000'; // URL бекенду

const UpdateProfilePage = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    position: '',
    photo: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  // Завантаження профілю користувача
  useEffect(() => {
    console.log('[DEBUG] Початок завантаження профілю');

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[ERROR] Токен відсутній. Авторизація необхідна.');
      setError('Токен відсутній. Авторизація необхідна.');
      navigate('/login');
      return;
    }

    console.log('[DEBUG] Токен знайдено:', token);

    axios
      .get(`${API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log('[DEBUG] Відповідь від сервера при завантаженні профілю:', response.data);

        setUserData({
          username: response.data.username || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          position: response.data.position || '',
          photo: response.data.avatarUrl || null,
        });

        setPhotoPreview(
          response.data.avatarUrl
            ? `${API_BASE_URL}${response.data.avatarUrl}`
            : null
        );

        setIsLoading(false);
        console.log('[DEBUG] Профіль завантажено успішно');
      })
      .catch((err) => {
        console.error('[ERROR] Помилка при завантаженні профілю:', err);

        if (err.response) {
          console.error('[ERROR] Відповідь сервера:', err.response.data);
          setError(err.response.data.message || 'Помилка завантаження профілю.');
        } else if (err.request) {
          console.error('[ERROR] Сервер не відповів на запит:', err.request);
          setError('Сервер не відповів. Перевірте підключення.');
        } else {
          console.error('[ERROR] Невідома помилка:', err.message);
          setError('Сталася невідома помилка.');
        }

        setIsLoading(false);
      });
  }, [navigate]);

  // Обробка оновлення профілю
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] Початок оновлення профілю');

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('[ERROR] Токен відсутній. Авторизація необхідна.');
      setError('Токен відсутній. Авторизація необхідна.');
      return;
    }

    console.log('[DEBUG] Формування даних для відправки');
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('phoneNumber', userData.phoneNumber);
    formData.append('position', userData.position);
    if (userData.photo) {
      formData.append('photo', userData.photo);
      console.log('[DEBUG] Фото додано до форми:', userData.photo.name);
    }

    try {
      console.log('[DEBUG] Відправка запиту на оновлення профілю');
      const response = await axios.put(
        `${API_BASE_URL}/api/user/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('[DEBUG] Відповідь сервера при оновленні профілю:', response.data);
      setSuccess(true);
      alert('Профіль успішно оновлено!');

      // Перенаправлення на сторінку воркера після успішного оновлення
      navigate('/worker'); // Ось тут ви виконуєте перенаправлення на сторінку воркера

    } catch (err) {
      console.error('[ERROR] Помилка при оновленні профілю:', err);

      if (err.response) {
        console.error('[ERROR] Відповідь сервера:', err.response.data);
        setError(err.response.data.message || 'Не вдалося оновити профіль.');
      } else if (err.request) {
        console.error('[ERROR] Сервер не відповів на запит:', err.request);
        setError('Сервер не відповів. Перевірте підключення.');
      } else {
        console.error('[ERROR] Невідома помилка:', err.message);
        setError('Сталася невідома помилка.');
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('[DEBUG] Фото вибрано:', file.name);
      setUserData({ ...userData, photo: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    console.log('[DEBUG] Завантаження профілю...');
    return <p>Завантаження...</p>;
  }

  if (error) {
    console.error('[ERROR] Помилка відображення сторінки:', error);
    return (
      <div style={{ textAlign: 'center', color: 'red' }}>
        <h1>Помилка</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Оновити профіль</h1>
      {photoPreview && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={photoPreview}
            alt="Аватар користувача"
            style={{ width: '150px', borderRadius: '50%' }}
          />
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Ім'я користувача:
          <input
            type="text"
            value={userData.username}
            onChange={(e) =>
              setUserData({ ...userData, username: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={userData.email} disabled />
        </label>
        <br />
        <label>
          Телефон:
          <input
            type="text"
            value={userData.phoneNumber}
            onChange={(e) =>
              setUserData({ ...userData, phoneNumber: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          Посада:
          <input
            type="text"
            value={userData.position}
            onChange={(e) =>
              setUserData({ ...userData, position: e.target.value })
            }
          />
        </label>
        <br />
        <label>
          Фото:
          <input type="file" onChange={handlePhotoChange} />
        </label>
        <br />
        <button type="submit">Зберегти</button>
      </form>
      {success && <p style={{ color: 'green' }}>Профіль успішно оновлено!</p>}
    </div>
  );
};

export default UpdateProfilePage;
