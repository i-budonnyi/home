import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://backend-avtologistika.onrender.com/api/administratorsRoutes";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [storageUsage, setStorageUsage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("❌ Авторизуйтесь, будь ласка.");
          navigate("/login");
          return;
        }

        const [usersRes, rolesRes, storageRes] = await Promise.all([
          axios.get(`${API_BASE}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/roles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/storage`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersRes.data.users || []);
        setRoles(rolesRes.data.roles || []);
        setStorageUsage(storageRes.data || {});
      } catch (err) {
        console.error("❌ Помилка завантаження:", err);
        setError("Не вдалося завантажити дані.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const getTokenHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/role`,
        { role: newRole },
        { headers: getTokenHeader() }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error("❌ Помилка зміни ролі:", err.message);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await axios.post(
        `${API_BASE}/users/${userId}/block`,
        { isBlocked },
        { headers: getTokenHeader() }
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isBlocked } : user
        )
      );
    } catch (err) {
      console.error("❌ Помилка блокування:", err.message);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const response = await axios.post(
        `${API_BASE}/users/${userId}/reset-password`,
        {},
        { headers: getTokenHeader() }
      );
      alert(`Новий пароль: ${response.data.newPassword}`);
    } catch (err) {
      console.error("❌ Помилка скидання пароля:", err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: getTokenHeader(),
      });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("❌ Помилка видалення:", err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/users`, newUser, {
        headers: {
          ...getTokenHeader(),
          "Content-Type": "application/json",
        },
      });
      setUsers((prev) => [...prev, response.data.user]);
      setNewUser({ username: "", email: "", password: "", role: "" });
      alert("✅ Користувача створено.");
    } catch (err) {
      console.error("❌ Помилка створення користувача:", err.message);
    }
  };

  if (isLoading) return <h1>Завантаження...</h1>;
  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Панель адміністратора</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Статистика сервера</h2>
        <p>
          Використано памʼяті: {storageUsage.used || 0} / {storageUsage.total || 0} GB
        </p>
        <p>Навантаження сайту: {storageUsage.load || "?"}%</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Користувачі</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Імʼя</th>
              <th>Пошта</th>
              <th>Роль</th>
              <th>Блок</th>
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
                  <button onClick={() => handleBlockUser(user.id, !user.isBlocked)}>
                    {user.isBlocked ? "Розблокувати" : "Заблокувати"}
                  </button>
                </td>
                <td>
                  <button onClick={() => handleResetPassword(user.id)}>Скинути пароль</button>
                  <button onClick={() => handleDeleteUser(user.id)}>Видалити</button>
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
            placeholder="Імʼя"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
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
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="">Оберіть роль</option>
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
