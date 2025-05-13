import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Menu, Typography, Button, Input, Form, message,
  ConfigProvider, theme, List, Card, Divider, Badge
} from "antd";
import {
  MessageOutlined, BulbOutlined, FileTextOutlined, ProjectOutlined,
  StarOutlined, PhoneOutlined, MailOutlined, UserOutlined,
  EditOutlined, SaveOutlined, SunOutlined, MoonOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content, Sider, Header } = Layout;
const { Title, Text } = Typography;
const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const WorkerPage = () => {
  const [userData, setUserData] = useState(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [editField, setEditField] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchUserProfile = async () => {
      try {
        console.log("👤 Отримання профілю користувача...");
        const res = await axios.get(`${API_BASE_URL}/userRoutes/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        console.log("✅ Профіль отримано:", user);

        setUserData({
          id: user.id,
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role?.toLowerCase() || "worker",
          editedOnce: user.edited_once || false,
        });
        form.setFieldsValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
        });
      } catch (err) {
        console.error("❌ Помилка отримання профілю:", err);
        setError(err.response?.data?.message || "Сталася помилка");
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchUserProfile();
  }, [navigate, form]);

  const fetchNotifications = useCallback(async () => {
    if (!userData?.id) {
      console.warn("🔸 userId відсутній, сповіщення не будуть завантажені.");
      return;
    }
    try {
      setLoadingNotifications(true);
      console.log(`📡 Запит сповіщень: GET /notifications/${userData.id}`);
      const res = await axios.get(`${API_BASE_URL}/notifications/${userData.id}`);
      console.log("📬 Відповідь з бекенду:", res.data);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("❌ Помилка запиту сповіщень:", err.message);
    } finally {
      setLoadingNotifications(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    if (userData?.id) fetchNotifications();
  }, [userData?.id, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      console.log("🔄 Позначення як прочитані:", unread.map(n => n.id));
      await Promise.all(unread.map(n =>
        axios.patch(`${API_BASE_URL}/notifications/${n.id}/read`)
      ));
      fetchNotifications();
    } catch (err) {
      console.error("❌ markAllAsRead:", err.message);
    }
  };

  const saveField = async (field) => {
    try {
      const values = await form.validateFields([field]);
      console.log("💾 Збереження поля:", field, values);
      await axios.patch(`${API_BASE_URL}/userRoutes/${userData.id}`, {
        [field]: values[field],
        edited_once: true,
      });
      setUserData(prev => ({ ...prev, [field]: values[field] }));
      setEditField(null);
      message.success("Збережено");
    } catch (err) {
      console.error("❌ Помилка збереження:", field, err);
      message.error("Помилка при збереженні");
    }
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
        <Sider width={340} style={{ background: "transparent", padding: "32px 24px 24px 24px" }}>
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
            style={{ background: "transparent", fontSize: 16, display: "flex", flexDirection: "column", gap: 16 }}
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

        <Layout style={{ marginLeft: 340 }}>
          <Header style={{ background: "transparent", height: 0, padding: 0 }} />
          <Content style={{ padding: "40px 0 40px 24px", background: themeMode.token.colorBgLayout }}>
            {isCheckingRole ? (
              <Title level={3}>⏳ Завантаження...</Title>
            ) : error ? (
              <Title level={3} type="danger">❌ {error}</Title>
            ) : (
              <Card style={{
                width: 880,
                borderRadius: 20,
                padding: 28,
                background: themeMode.token.colorBgContainer,
                boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.5)" : "0 6px 18px rgba(0,0,0,0.1)"
              }} bordered={false}>
                <Title level={4} style={{ marginBottom: 4 }}>{userData.firstName} {userData.lastName}</Title>
                <Text type="secondary">
                  Роль: <Badge count={userData.role} style={{ backgroundColor: "#08966E" }} />
                </Text>
                <Divider />
                <Form form={form} layout="vertical">
                  {["first_name", "last_name", "phone", "email"].map((field) => (
                    <Form.Item key={field} label={getLabel(field)} name={field}>
                      <Input
                        disabled={editField !== field}
                        prefix={getIcon(field)}
                        addonAfter={
                          editField === field ? (
                            <SaveOutlined onClick={() => saveField(field)} style={{ cursor: "pointer" }} />
                          ) : (
                            <EditOutlined onClick={() => setEditField(field)} style={{ cursor: "pointer" }} />
                          )
                        }
                      />
                    </Form.Item>
                  ))}
                </Form>
                <Divider />
                <Title level={5} style={{ marginTop: 24 }}>
                  Новини ({notifications.filter(n => !n.is_read).length})
                </Title>
                <List
                  bordered={false}
                  loading={loadingNotifications}
                  locale={{ emptyText: "Наразі немає новин" }}
                  dataSource={notifications}
                  renderItem={(item) => (
                    <List.Item style={{ opacity: item.is_read ? 0.5 : 1, padding: 12 }}>
                      {item.message}
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

const getLabel = (field) => ({
  first_name: "Ім’я",
  last_name: "Прізвище",
  phone: "Телефон",
  email: "Email",
}[field]);

const getIcon = (field) => ({
  first_name: <UserOutlined />,
  last_name: <UserOutlined />,
  phone: <PhoneOutlined />,
  email: <MailOutlined />,
}[field]);

export default WorkerPage;
