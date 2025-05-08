import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Menu, Card, Avatar, Typography, List,
  Button, Input, Form, message, ConfigProvider, theme
} from "antd";
import {
  MessageOutlined, BulbOutlined, FileTextOutlined, ProjectOutlined,
  StarOutlined, PhoneOutlined, MailOutlined, UserOutlined,
  EditOutlined, SaveOutlined, MoonOutlined, SunOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const WorkerPage = () => {
  const [userData, setUserData] = useState(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
        const res = await axios.get(`${API_BASE_URL}/userRoutes/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        setUserData({
          id: user.id,
          firstName: user.first_name || "",
          lastName: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          profilePicture: user.profile_picture || "",
          role: user.role?.toLowerCase() || "worker",
          editedOnce: user.edited_once || false,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Сталася помилка");
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const fetchNotifications = useCallback(async () => {
    if (!userData?.id) return;
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`${API_BASE_URL}/notifications/${userData.id}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("❌ Новини:", err.message);
    } finally {
      setLoadingNotifications(false);
    }
  }, [userData?.id]);

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => axios.patch(`${API_BASE_URL}/notifications/${n.id}/read`)));
      fetchNotifications();
    } catch (err) {
      console.error("❌ markAllAsRead:", err.message);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await axios.patch(`${API_BASE_URL}/userRoutes/${userData.id}`, {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        edited_once: true,
      });
      setUserData({
        ...userData,
        firstName: values.first_name,
        lastName: values.last_name,
        email: values.email,
        phone: values.phone,
        editedOnce: true,
      });
      setIsEditing(false);
      message.success("Дані успішно оновлено!");
    } catch {
      message.error("Помилка при оновленні");
    }
  };

  useEffect(() => {
    if (userData?.id) fetchNotifications();
  }, [userData, fetchNotifications]);

  const themeMode = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider theme={{ algorithm: themeMode }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={250} style={styles.sider} theme={isDarkMode ? "dark" : "light"}>
          <div style={styles.logo}>
            <Title level={4} style={{ ...styles.logoText, color: isDarkMode ? "#fff" : "#222" }}>
              Avtologistika
            </Title>
            <Button
              type="text"
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              style={{ fontSize: 18 }}
            />
          </div>
          <Menu
            mode="inline"
            theme={isDarkMode ? "dark" : "light"}
            selectedKeys={[window.location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={[
              { key: "/blog", icon: <MessageOutlined />, label: "Блог" },
              { key: "/submit-idea", icon: <BulbOutlined />, label: "Подати ідею" },
              { key: "/submit-problem", icon: <FileTextOutlined />, label: "Подати проблему" },
              { key: "/my-problems", icon: <ProjectOutlined />, label: "Мої проблеми" },
              { key: "/projects", icon: <ProjectOutlined />, label: "Мої подані ідеї" },
              { key: "/subscriptions", icon: <StarOutlined />, label: "Підписка" },
            ]}
          />
        </Sider>

        <Layout style={{ marginLeft: 250 }}>
          <Content style={styles.content}>
            {isCheckingRole ? (
              <Title level={3}>⏳ Завантаження...</Title>
            ) : error ? (
              <Title level={3} type="danger">❌ {error}</Title>
            ) : (
              <Card hoverable style={styles.card}>
                <Card.Meta
                  avatar={
                    <Avatar
                      size={72}
                      src={userData.profilePicture || null}
                      icon={!userData.profilePicture && <UserOutlined />}
                    />
                  }
                  title={
                    <Title level={4}>
                      {`${userData.firstName} ${userData.lastName}` || "Користувач"}
                    </Title>
                  }
                  description={`Роль: ${userData.role}`}
                />
                <Form
                  form={form}
                  initialValues={{
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                  }}
                  layout="vertical"
                  style={{ marginTop: 24 }}
                >
                  <Form.Item name="first_name" label="Ім’я">
                    <Input disabled={!isEditing} prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="last_name" label="Прізвище">
                    <Input disabled={!isEditing} prefix={<UserOutlined />} />
                  </Form.Item>
                  <Form.Item name="phone" label="Телефон">
                    <Input disabled={!isEditing} prefix={<PhoneOutlined />} />
                  </Form.Item>
                  <Form.Item name="email" label="Email">
                    <Input disabled={!isEditing} prefix={<MailOutlined />} />
                  </Form.Item>
                </Form>
                {!userData.editedOnce && (
                  <Button
                    type="primary"
                    icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    style={{ width: "100%", marginTop: 16 }}
                  >
                    {isEditing ? "Зберегти зміни" : "Редагувати дані"}
                  </Button>
                )}

                <div style={{ marginTop: 40 }}>
                  <Title level={4}>
                    Новини ({notifications.filter(n => !n.is_read).length})
                  </Title>
                  <List
                    bordered
                    loading={loadingNotifications}
                    locale={{ emptyText: "Наразі немає новин" }}
                    dataSource={notifications}
                    renderItem={(item) => (
                      <List.Item style={{ opacity: item.is_read ? 0.5 : 1 }}>
                        {item.message}
                      </List.Item>
                    )}
                  />
                  {notifications.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <Button onClick={markAllAsRead}>Позначити всі як прочитані</Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

const styles = {
  sider: {
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    bottom: 0,
    borderRight: "1px solid #001f3f",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  logo: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
  },
  content: {
    padding: "30px 50px",
    minHeight: "100vh",
    background: "var(--background-color)",
  },
  card: {
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
  },
};

export default WorkerPage;
