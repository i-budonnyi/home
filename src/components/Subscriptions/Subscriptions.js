/* Subscriptions.jsx */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  List,
  Card,
  Typography,
  Skeleton,
  Alert,
  Tag,
  Button,
  ConfigProvider,
  theme,
  Select,
  Space,
} from "antd";
import {
  SunOutlined,
  MoonOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { Option } = Select;

/* === API === */
const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_SUBSCRIPTIONS_URL = `${API_BASE}/subscriptionRoutes/user-subscriptions`;
const API_STATUSES_URL = `${API_BASE}/statusRoutes/get-statuses`;

/* ---------- Компонент ---------- */
const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("усі");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* тема */
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  const navigate = useNavigate();
  const getAuthToken = () => localStorage.getItem("token");

  /* ---------- Отримуємо статуси та підписки ---------- */
  const fetchStatuses = async () => {
    try {
      const res = await axios.get(
        `${API_STATUSES_URL}?nocache=${Date.now()}`
      );
      if (Array.isArray(res.data))
        setStatuses(
          res.data.filter((s) => typeof s === "string" && s.trim())
        );
    } catch (err) {
      console.warn("⚠️ Статуси:", err.message);
    }
  };

  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Потрібна авторизація");

      const res = await axios.get(API_SUBSCRIPTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.subscriptions || [];
      setSubscriptions(data);
      filterByStatus(data, selectedStatus);
    } catch (err) {
      console.error("❌ Запит підписок:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Сталася помилка на сервері"
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchStatuses();
    fetchUserSubscriptions();
  }, [fetchUserSubscriptions]);

  /* ---------- Фільтр ---------- */
  const filterByStatus = (data, status) => {
    if (status.toLowerCase() === "усі") setFilteredSubscriptions(data);
    else setFilteredSubscriptions(data.filter((s) => s.status === status));
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    filterByStatus(subscriptions, value);
  };

  /* ---------- Допоміжні ---------- */
  const translateStatus = (s) =>
    (s || "")
      .replace(/до_секретаря/gi, "Амбасадор ➜ Секретар")
      .replace(/pending/i, "Очікує")
      .replace(/approved/i, "Схвалено")
      .replace(/rejected/i, "Відхилено")
      .toUpperCase();

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "до_секретаря":
        return "purple";
      default:
        return "blue";
    }
  };

  /* ---------- Перехід до блогу ---------- */
  const handleDetailsClick = (entry_type, entry_id) => {
    if (!entry_type || !entry_id) return;
    navigate("/blog", {
      state: { entryType: entry_type, entryId: entry_id, timestamp: Date.now() },
    });
  };

  /* ---------- Тема Ant Design ---------- */
  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1E63F2",
      borderRadius: 12,
      fontFamily: "Roboto, sans-serif",
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout: isDarkMode ? "#121212" : "#F4F6F8",
      colorBorder: isDarkMode ? "#2C313A" : "#DDE1E6",
    },
  };

  /* ---------- UI ---------- */
  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header style={{ background: "transparent", padding: 0 }} />
        <Content style={{ padding: "60px 20px 20px", maxWidth: 900, margin: "0 auto" }}>
          {/* Панель керування */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
            <div
              onClick={toggleTheme}
              style={{ cursor: "pointer", fontSize: 20, color: themeMode.token.colorTextBase }}
              title="Перемкнути тему"
            >
              {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </div>
            <Button type="link" onClick={() => navigate("/worker")}>
              Назад
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchUserSubscriptions} />
            <Select value={selectedStatus} onChange={handleStatusChange} style={{ minWidth: 200 }}>
              <Option value="усі">Усі статуси</Option>
              {statuses.map((s) => (
                <Option key={s} value={s}>
                  {translateStatus(s)}
                </Option>
              ))}
            </Select>
          </div>

          {/* Заголовок */}
          <Title level={3} style={{ textAlign: "center", color: themeMode.token.colorTextBase }}>
            Мої підписки
          </Title>

          {/* Контент */}
          {error && <Alert message={error} type="error" showIcon />}
          {isLoading ? (
            <Skeleton active />
          ) : filteredSubscriptions.length === 0 ? (
            <Alert message="Підписок не знайдено" type="info" showIcon />
          ) : (
            <List
              grid={{ gutter: 20, column: 1 }}
              dataSource={filteredSubscriptions}
              renderItem={(sub) => (
                <List.Item>
                  <Card
                    hoverable
                    title={
                      <Title level={4} style={{ margin: 0, color: themeMode.token.colorTextBase }}>
                        {sub.title || "Без назви"}
                      </Title>
                    }
                    style={{
                      borderRadius: 12,
                      background: themeMode.token.colorBgContainer,
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.45)"
                        : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                    bordered={false}
                  >
                    <Text style={{ color: themeMode.token.colorTextBase }}>
                      {sub.description || "Без опису"}
                    </Text>
                    <br />
                    <Tag color={getStatusColor(sub.status)} style={{ marginTop: 10 }}>
                      {translateStatus(sub.status || "не вказано")}
                    </Tag>
                    <br />
                    <Text type="secondary">
                      Автор:&nbsp;
                      {sub.author_first_name && sub.author_last_name
                        ? `${sub.author_first_name} ${sub.author_last_name}`
                        : sub.author || "Невідомий"}
                    </Text>
                    <br />
                    <Space style={{ marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={() => handleDetailsClick(sub.entry_type, sub.entry_id)}
                      >
                        Детальніше
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default Subscriptions;
