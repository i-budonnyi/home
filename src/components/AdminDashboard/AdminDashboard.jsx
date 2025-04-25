import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [storageUsage, setStorageUsage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Поля для створення нового користувача
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "" });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const [usersResponse, rolesResponse, storageResponse] = await Promise.all([
          axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/roles", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/admin/storage", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUsers(usersResponse.data.users || []);
        setRoles(rolesResponse.data.roles || []);
        setStorageUsage(storageResponse.data || {});
      } catch (err) {
        setError("Не вдалося завантажити дані.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Обробка зміни ролі
  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("Помилка зміни ролі:", err.message);
    }
  };

  // Обробка блокування/розблокування
  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/admin/users/${userId}/block`,
        { isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isBlocked } : user
        )
      );
    } catch (err) {
      console.error("Помилка блокування:", err.message);
    }
  };

  // Обробка створення нового пароля
  const handleResetPassword = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/admin/users/${userId}/reset-password`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Новий пароль: ${response.data.newPassword}`);
    } catch (err) {
      console.error("Помилка скидання пароля:", err.message);
    }
  };

  // Обробка видалення користувача
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Помилка видалення користувача:", err.message);
    }
  };

  // Обробка створення нового користувача
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/admin/users",
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => [...prev, response.data.user]);
      setNewUser({ username: "", email: "", password: "", role: "" });
      alert("Користувач успішно створений.");
    } catch (err) {
      console.error("Помилка створення користувача:", err.message);
    }
  };

  if (isLoading) return <h1>Завантаження...</h1>;
  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Панель Адміністратора</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Статистика сервера</h2>
        <p>Використання місця: {storageUsage.used || 0} / {storageUsage.total || 0} ГБ</p>
        <p>Навантаження сайту: {storageUsage.load || "Не відомо"}%</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Користувачі</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Ім'я</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Блокування</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => handleBlockUser(user.id, !user.isBlocked)}
                  >
                    {user.isBlocked ? "Розблокувати" : "Блокувати"}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleResetPassword(user.id)}>
                    Новий пароль
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)}>
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Створити нового користувача</h2>
        <form onSubmit={handleCreateUser}>
          <input
            placeholder="Ім'я"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <input
            placeholder="Пароль"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="">Виберіть роль</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button type="submit">Створити</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
