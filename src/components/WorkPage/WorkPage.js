import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Menu, Avatar, Typography, Button, Input, Form, message,
  ConfigProvider, theme, Row, Col, List, Card, Space
} from "antd";
import {
  MessageOutlined, BulbOutlined, FileTextOutlined, ProjectOutlined,
  StarOutlined, PhoneOutlined, MailOutlined, UserOutlined,
  EditOutlined, SaveOutlined, SunOutlined, MoonOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content, Sider, Header } = Layout;
const { Title } = Typography;
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
        form.setFieldsValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Сталася помилка");
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchUserProfile();
  }, [navigate, form]);

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

  const saveField = async (field) => {
    try {
      const values = await form.validateFields([field]);
      await axios.patch(`${API_BASE_URL}/userRoutes/${userData.id}`, {
        [field === "first_name" ? "first_name" : field]: values[field],
        edited_once: true,
      });
      setUserData(prev => ({ ...prev, [field]: values[field] }));
      setEditField(null);
      message.success("Збережено");
    } catch {
      message.error("Помилка при збереженні");
    }
  };

  const themeMode = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider theme={{
      algorithm: themeMode,
      token: {
        colorText: isDarkMode ? "#fff" : "#000",
        colorBgContainer: isDarkMode ? "#1f1f1f" : "#fff",
        colorPrimary: "#1890ff"
      }
    }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={240} style={styles.sider} theme={isDarkMode ? "dark" : "light"}>
          <div style={styles.logo}>
            <Title level={4} style={{ color: isDarkMode ? "#fff" : "#222", margin: 0 }}>
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

        <Layout style={{ marginLeft: 240 }}>
          <Header style={styles.header} />
          <Content style={styles.content}>
            {isCheckingRole ? (
              <Title level={3}>⏳ Завантаження...</Title>
            ) : error ? (
              <Title level={3} type="danger">❌ {error}</Title>
            ) : (
              <Row justify="start">
                <Col xs={24} sm={22} md={20} lg={16} xl={14}>
                  <Card style={styles.card} bordered={false}>
                    <Space direction="horizontal" align="center" style={{ marginBottom: 24 }}>
                      <Avatar size={64} icon={<UserOutlined />} src={userData.profilePicture} />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {userData.firstName} {userData.lastName}
                        </Title>
                        <div style={{ color: "#888" }}>Роль: {userData.role}</div>
                      </div>
                    </Space>

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

                    <div style={{ marginTop: 40 }}>
                      <Title level={4}>Новини ({notifications.filter(n => !n.is_read).length})</Title>
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
                </Col>
              </Row>
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
  email: "Email"
}[field]);

const getIcon = (field) => ({
  first_name: <UserOutlined />,
  last_name: <UserOutlined />,
  phone: <PhoneOutlined />,
  email: <MailOutlined />
}[field]);

const styles = {
  sider: {
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    borderRight: "1px solid #001f3f",
    paddingTop: 20,
    display: "flex",
    flexDirection: "column"
  },
  logo: {
    padding: "0 16px 16px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  header: {
    background: "transparent",
    height: 20
  },
  content: {
    padding: "40px 50px",
    background: "#f5f6fa",
    minHeight: "100vh"
  },
  card: {
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
    background: "#fff"
  }
};

export default WorkerPage;
