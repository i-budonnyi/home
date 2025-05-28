import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Menu, Typography, Button, ConfigProvider, theme,
  List, Card, Divider, Badge
} from "antd";
import {
  MessageOutlined, BulbOutlined, FileTextOutlined, ProjectOutlined,
  StarOutlined, SunOutlined, MoonOutlined, PhoneOutlined, MailOutlined
} from "@ant-design/icons";
import axios from "axios";
import io from "socket.io-client";

const { Content, Sider, Header } = Layout;
const { Title, Text } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const SOCKET_URL = "https://backend-avtologistika.onrender.com";

const WorkerPage = () => {
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/userRoutes/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data;
      setUserData({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role?.toLowerCase() || "worker",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Сталася помилка");
      }
    } finally {
      setIsCheckingRole(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchUserProfile();
    }
  }, [token, navigate, fetchUserProfile]);

  useEffect(() => {
    if (!userData?.id || !token) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("🟢 WebSocket connected:", socket.id);
      socket.emit("register", userData.id);
    });

    socket.on("notification", (data) => {
      console.log("🔔 Notification received:", data);
      setNotifications(prev => [data, ...prev]);
    });

    socket.on("disconnect", () => {
      console.warn("🔴 WebSocket disconnected");
    });

    return () => socket.disconnect();
  }, [userData?.id, token]);

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    try {
      await Promise.all(
        unread.map(n =>
          axios.patch(`${API_BASE}/notifications/${n.id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("❌ markAllAsRead:", err.message || err);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1E63F2",
      fontFamily: "Roboto, sans-serif",
      borderRadius: 20,
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout: isDarkMode ? "#121212" : "#F0F2F5",
      colorBorder: isDarkMode ? "#2C313A" : "#DDE1E6",
    },
  };

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={340} style={{ background: "transparent", padding: "32px 24px 48px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ fontSize: 20, color: isDarkMode ? "#fff" : "#1E63F2" }}
            />
          </div>
          <Menu
            mode="inline"
            theme={isDarkMode ? "dark" : "light"}
            selectedKeys={[window.location.pathname]}
            onClick={({ key }) => navigate(key)}
            style={{ background: "transparent", fontSize: 16 }}
            items={[
              { key: "/submit-idea", icon: <BulbOutlined />, label: "Подати ідею" },
              { key: "/submit-problem", icon: <FileTextOutlined />, label: "Подати проблему" },
              { key: "/blog", icon: <MessageOutlined />, label: "Блог" },
              { key: "/my-problems", icon: <ProjectOutlined />, label: "Мої проблеми" },
              { key: "/projects", icon: <ProjectOutlined />, label: "Мої подані ідеї" },
              { key: "/subscriptions", icon: <StarOutlined />, label: "Мої підписки" },
            ]}
          />
        </Sider>

        <Layout>
          <Header style={{ background: "transparent", height: 20, padding: 0 }} />
          <Content style={{ padding: "40px", background: themeMode.token.colorBgLayout }}>
            {isCheckingRole ? (
              <Title level={3}>⏳ Завантаження...</Title>
            ) : error ? (
              <Title level={3} type="danger">❌ {error}</Title>
            ) : (
              <Card
                style={{
                  maxWidth: 880,
                  margin: "0 auto",
                  borderRadius: 20,
                  padding: 28,
                  background: themeMode.token.colorBgContainer,
                  boxShadow: isDarkMode
                    ? "0 8px 24px rgba(0,0,0,0.5)"
                    : "0 6px 18px rgba(0,0,0,0.1)",
                }}
                bordered={false}
              >
                <Title level={4}>{userData?.firstName} {userData?.lastName}</Title>
                <Text type="secondary">Роль: <Badge count={userData?.role} style={{ backgroundColor: "#08966E" }} /></Text>
                <Divider />
                <Text><MailOutlined /> {userData?.email}</Text><br />
                <Text><PhoneOutlined /> {userData?.phone}</Text><br />
                <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate("/edit-profile")}>
                  Редагувати профіль
                </Button>
                <Divider />
                <Title level={5} style={{ marginTop: 24 }}>
                  Новини ({notifications.filter(n => !n.is_read).length})
                </Title>
                <List
                  bordered={false}
                  locale={{ emptyText: "Наразі немає новин" }}
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item style={{ opacity: item.is_read ? 0.5 : 1, padding: 12 }}>
                      {sanitizeText(item.message)}
                    </List.Item>
                  )}
                />
                {notifications.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Button onClick={markAllAsRead} type="primary">Позначити всі як прочитані</Button>
                  </div>
                )}
              </Card>
            )}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

const sanitizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s.,!?"'():-]/gu, "")
    .trim();
};

export default WorkerPage;
