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
  message,
  Button,
  ConfigProvider,
  theme
} from "antd";
import { useNavigate } from "react-router-dom";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const API_SUBSCRIPTIONS_URL = "https://backend-avtologistika.onrender.com/api/subscriptionRoutes/user-subscriptions";
const API_UPDATE_STATUS_URL = "https://backend-avtologistika.onrender.com/api/statusRoutes/update-status"; // замість AMBASSADOR_API

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();
  const getAuthToken = () => localStorage.getItem("token");

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("⛔ Необхідна авторизація.");

      const response = await axios.get(API_SUBSCRIPTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data.subscriptions) {
        setSubscriptions(response.data.subscriptions);
      } else {
        throw new Error("❌ Не вдалося отримати підписки.");
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА:", err);
      setError(err.response?.data?.message || err.message || "Сталася помилка.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserSubscriptions();
  }, [fetchUserSubscriptions]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "approved": return "green";
      case "rejected": return "red";
      case "до_секретаря": return "purple";
      default: return "blue";
    }
  };

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

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header
          style={{
            background: "transparent",
            padding: "16px 24px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              onClick={toggleTheme}
              style={{ cursor: "pointer", fontSize: 20, color: themeMode.token.colorTextBase }}
              title="Перемкнути тему"
            >
              {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </div>

            <Button type="link" onClick={() => navigate("/worker")} style={{ fontSize: 16 }}>
              Назад
            </Button>
          </div>
        </Header>

        <Content style={{ padding: "80px 20px 20px", maxWidth: "900px", margin: "0 auto" }}>
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 40,
              color: themeMode.token.colorTextBase,
            }}
          >
            Мої підписки
          </Title>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

          {isLoading ? (
            <Skeleton active />
          ) : (
            <List
              grid={{ gutter: 20, column: 1 }}
              dataSource={subscriptions}
              renderItem={(sub) => (
                <List.Item>
                  <Card
                    hoverable
                    title={
                      <Title
                        level={4}
                        style={{ marginBottom: 0, color: themeMode.token.colorTextBase }}
                      >
                        {sub.title || "Без назви"}
                      </Title>
                    }
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.4)"
                        : "0 4px 10px rgba(0,0,0,0.1)",
                      background: themeMode.token.colorBgContainer,
                    }}
                    bordered={false}
                  >
                    <Text style={{ color: themeMode.token.colorTextBase }}>
                      {sub.description || "Без опису"}
                    </Text>
                    <br />
                    <Tag
                      color={getStatusColor(sub.status)}
                      style={{ marginTop: "10px", fontSize: "14px" }}
                    >
                      {sub.status ? sub.status.toUpperCase() : "НЕ ВКАЗАНО"}
                    </Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      Автор:{" "}
                      {sub.author_first_name && sub.author_last_name
                        ? `${sub.author_first_name} ${sub.author_last_name}`
                        : sub.author || "Невідомий"}
                    </Text>
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
