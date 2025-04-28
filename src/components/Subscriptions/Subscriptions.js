import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Layout, List, Card, Typography, Skeleton, Alert, Tag } from "antd";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

// ✅ НОВИЙ правильний API шлях
const API_SUBSCRIPTIONS_URL = "https://idea-backend.onrender.com/api/subscriptionRoutes/user-subscriptions";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  // 🔥 Обгорнули fetchUserSubscriptions у useCallback
  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("❌ Необхідна авторизація. Будь ласка, увійдіть у систему.");
      }

      console.log("📢 Виконується API-запит до", API_SUBSCRIPTIONS_URL);
      const response = await axios.get(API_SUBSCRIPTIONS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📩 Відповідь API:", response.data);

      if (response.status === 200 && response.data.subscriptions) {
        console.log("✅ Отримані підписки:", response.data.subscriptions);
        setSubscriptions(response.data.subscriptions);
      } else {
        throw new Error(response.data.message || "Не вдалося отримати підписки.");
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА у fetchUserSubscriptions:", err.response?.data || err.message);
      setError(err.response?.data?.message || "❌ Не вдалося завантажити ваші підписки.");
    } finally {
      setIsLoading(false);
    }
  }, []); // пусті залежності тут норм

  useEffect(() => {
    fetchUserSubscriptions();
  }, [fetchUserSubscriptions]); // 🔥 додали fetchUserSubscriptions у залежності

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "15px" }}>
        <Title style={{ color: "white", fontSize: "24px" }}>Мої підписки</Title>
      </Header>

      <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
        {error && <Alert message={error} type="error" showIcon />}
        {isLoading ? (
          <Skeleton active />
        ) : (
          <List
            grid={{ gutter: 20, column: 1 }}
            dataSource={subscriptions}
            renderItem={(subscription) => (
              <List.Item>
                <Card
                  hoverable
                  title={<Title level={4}>{subscription.title || "Без назви"}</Title>}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    background: "#ffffff",
                  }}
                >
                  <Text>{subscription.description || "Без опису"}</Text>
                  <br />
                  <Tag color={getStatusColor(subscription.status)} style={{ marginTop: "10px", fontSize: "14px" }}>
                    {subscription.status ? subscription.status.toUpperCase() : "НЕ ВКАЗАНО"}
                  </Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: "14px", marginTop: "5px" }}>
                    Автор:{" "}
                    {subscription.author_first_name && subscription.author_last_name
                      ? `${subscription.author_first_name} ${subscription.author_last_name}`
                      : "Невідомий"}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Content>
    </Layout>
  );
};

export default Subscriptions;
