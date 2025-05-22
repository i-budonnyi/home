import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Layout, List, Card, Typography, Skeleton, Alert, Tag, message } from "antd";
import { io } from "socket.io-client";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const API_SUBSCRIPTIONS_URL = "https://backend-avtologistika.onrender.com/api/subscriptionRoutes/user-subscriptions";
const SOCKET_URL = "https://backend-avtologistika.onrender.com"; // без /api
let socket;

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

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

    // 🔌 Підключення WebSocket
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token: getAuthToken() }
    });

    socket.on("connect", () => {
      console.log("🧠 WebSocket підключено:", socket.id);
    });

    socket.on("subscription_update", (data) => {
      console.log("📬 Отримано оновлення підписки:", data);
      message.info("🔔 Змінилась підписка на ідею");
      fetchUserSubscriptions(); // перезавантажити список
    });

    socket.on("disconnect", () => {
      console.warn("📴 Вебсокет відключено");
    });

    return () => {
      if (socket) socket.disconnect();
    };
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
            renderItem={(sub) => (
              <List.Item>
                <Card
                  hoverable
                  title={<Title level={4}>{sub.title || "Без назви"}</Title>}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    background: "#ffffff",
                  }}
                >
                  <Text>{sub.description || "Без опису"}</Text>
                  <br />
                  <Tag color={getStatusColor(sub.status)} style={{ marginTop: "10px", fontSize: "14px" }}>
                    {sub.status ? sub.status.toUpperCase() : "НЕ ВКАЗАНО"}
                  </Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: "14px", marginTop: "5px" }}>
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
  );
};

export default Subscriptions;
