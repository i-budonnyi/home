import React, { useState, useEffect } from "react";
import axios from "axios";
import { message, Input, Button, Typography, Spin } from "antd";

const { Title } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api/userRoutes";
const PROFILE_URL = `${API_BASE}/profile`;
const UPDATE_URL = `${API_BASE}/update-profile`;

const ProfileSettingsPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(PROFILE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
      } catch (err) {
        console.error("❌ Помилка завантаження профілю:", err);
        message.error("Не вдалося отримати профіль.");
      } finally {
        setInitialLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      message.error("❌ Ви не авторизовані.");
      setInitialLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        username,
        email,
      };

      if (password.trim()) payload.password = password;

      const response = await axios.put(UPDATE_URL, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        message.success("✅ Профіль успішно оновлено!");
        setPassword("");
      } else {
        message.warning("⚠️ Сталася помилка.");
      }
    } catch (error) {
      console.error("❌ Помилка оновлення профілю:", error);
      message.error("❌ Не вдалося оновити профіль.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <Spin tip="Завантаження профілю..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "40px 20px" }}>
      <Title level={3}>Налаштування профілю</Title>
      <p>Оновіть своє ім’я, пошту або пароль.</p>

      <form onSubmit={handleSubmit}>
        <label>Ім’я користувача</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ваше ім’я"
          style={{ marginBottom: "16px" }}
        />

        <label>Електронна пошта</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{ marginBottom: "16px" }}
        />

        <label>Новий пароль (необов’язково)</label>
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Новий пароль"
          style={{ marginBottom: "24px" }}
        />

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ borderRadius: "8px", width: "100%" }}
        >
          {loading ? "Оновлення..." : "Зберегти зміни"}
        </Button>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
