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
} from "antd";
import { useNavigate } from "react-router-dom";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_SUBSCRIPTIONS_URL = `${API_BASE}/subscriptionRoutes/user-subscriptions`;
const API_STATUS_UPDATE = `${API_BASE}/statusRoutes/update-status`;

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

      if (response.status === 200) {
        setSubscriptions(response.data.subscriptions);
      } else {
        throw new Error("❌ Не вдалося отримати підписки.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
    token: {
      colorPrimary: "#1E63F2",
      colorBgLayout: isDarkMode ? "#121212" : "#f4f6f8",
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#ffffff",
    }
  };

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header style={{ background: "transparent", padding: "16px 24px 0" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
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
          </div>
        </Header>

        <Content style={{ padding: "80px 20px 20px", maxWidth: "900px", margin: "0 auto" }}>
          <Title level={3} style={{ textAlign: "center", color: themeMode.token.colorTextBase }}>
            Мої підписки
          </Title>

          {error && <Alert message={error} type="error" showIcon />}
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
                    title={<Title level={4}>{sub.title || "Без назви"}</Title>}
                    style={{
                      borderRadius: "10px",
                      background: themeMode.token.colorBgContainer,
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.4)"
                        : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Text>{sub.description || "Без опису"}</Text>
                    <br />
                    <Tag color={getStatusColor(sub.status)} style={{ marginTop: "10px" }}>
                      {sub.status?.toUpperCase() || "N/A"}
                    </Tag>
                    <br />
                    <Text type="secondary">
                      Автор:{" "}
                      {sub.author_first_name && sub.author_last_name
                        ? `${sub.author_first_name} ${sub.author_last_name}`
                        : "Невідомий"}
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
