import React, { useState, useEffect } from 'react';

const Administrators = () => {
  const [administrators, setAdministrators] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
  });

  const API_URL = 'http://192.168.0.116:5000/api/administrators';

  // Отримати всіх адміністраторів
  const fetchAdministrators = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setAdministrators(data);
    } catch (error) {
      console.error('Error fetching administrators:', error);
    }
  };

  // Додати нового адміністратора
  const createAdministrator = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      alert('Administrator created successfully!');
      setFormData({ first_name: '', last_name: '', phone: '', email: '', password: '' });
      fetchAdministrators(); // Оновити список
    } catch (error) {
      console.error('Error creating administrator:', error);
    }
  };

  // Видалити адміністратора
  const deleteAdministrator = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      alert('Administrator deleted successfully!');
      fetchAdministrators(); // Оновити список
    } catch (error) {
      console.error('Error deleting administrator:', error);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Administrators</h1>

      {/* Форма для додавання адміністратора */}
      <form onSubmit={createAdministrator}>
        <h2>Add New Administrator</h2>
        <input
          type="text"
          placeholder="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          style={{ margin: '5px', padding: '10px', width: '200px' }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            margin: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add Administrator
        </button>
      </form>

      {/* Таблиця адміністраторів */}
      <h2>Administrator List</h2>
      <table border="1" style={{ width: '100%', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {administrators.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.id}</td>
              <td>{admin.first_name}</td>
              <td>{admin.last_name}</td>
              <td>{admin.phone}</td>
              <td>{admin.email}</td>
              <td>
                <button
                  onClick={() => deleteAdministrator(admin.id)}
                  style={{
                    padding: '5px 10px',
                    margin: '2px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Administrators;
