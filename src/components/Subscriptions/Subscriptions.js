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
} from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

// 🔗 Актуальний API endpoint
const API_SUBSCRIPTIONS_URL =
  "https://backend-avtologistika.onrender.com/api/subscriptionRoutes/user-subscriptions";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const navigate = useNavigate();

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("🔑 JWT Token з localStorage:", token || "❌ Відсутній");
    return token;
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  const fetchUserSubscriptions = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Необхідно увійти в систему.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(API_SUBSCRIPTIONS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200 && Array.isArray(response.data.subscriptions)) {
        setSubscriptions(response.data.subscriptions);
      } else {
        throw new Error("❌ Структура відповіді не відповідає очікуваній.");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError("Доступ заборонено. Увійдіть повторно.");
        } else {
          setError(err.response.data?.message || "Помилка на сервері.");
        }
      } else {
        setError(err.message || "Невідома помилка.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserSubscriptions();
  }, [fetchUserSubscriptions]);

  const getStatusColor = (status) => {
    if (!status) return "default";
    const normalized = status.toLowerCase();

    switch (normalized) {
      case "pending":
      case "очікує":
        return "orange";
      case "approved":
      case "затверджено":
        return "green";
      case "rejected":
      case "відхилено":
        return "red";
      case "до_секретаря":
        return "purple";
      default:
        return "blue";
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
        <Header style={{ background: "transparent", padding: "0 24px" }} />
        <Content style={{ padding: "60px 20px 20px", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
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

          {error && <Alert message={error} type="error" showIcon />}
          {isLoading ? (
            <Skeleton active />
          ) : subscriptions.length === 0 ? (
            <Alert message="Підписок не знайдено." type="info" showIcon />
          ) : (
            <List
              grid={{ gutter: 20, column: 1 }}
              dataSource={subscriptions}
              renderItem={(sub) => (
                <List.Item>
                  <Card
                    hoverable
                    title={
                      <Title level={4} style={{ marginBottom: 0, color: themeMode.token.colorTextBase }}>
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
                      {sub.status
                        ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1)
                        : "Статус відсутній"}
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
