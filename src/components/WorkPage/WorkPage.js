import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Card,
  Avatar,
  Typography,
  Space,
  Dropdown,
  Badge,
  List,
  Button as AntButton,
  Input,
  Form,
  message,
} from "antd";
import {
  MessageOutlined,
  BulbOutlined,
  FileTextOutlined,
  ProjectOutlined,
  StarOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  BellOutlined,
  EditOutlined,
  SaveOutlined,
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
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/userRoutes/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userRole = response.data.role?.toLowerCase() || "worker";
        setUserData({
          id: response.data.id,
          firstName: response.data.first_name || "",
          lastName: response.data.last_name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          profilePicture: response.data.profile_picture || "",
          role: userRole,
          editedOnce: response.data.edited_once || false,
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
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          axios.patch(`${API_BASE_URL}/notifications/${n.id}/read`)
        )
      );
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
      message.success("Дані оновлено!");
    } catch (err) {
      message.error("Помилка при оновленні");
    }
  };

  useEffect(() => {
    if (userData?.id) fetchNotifications();
  }, [userData, fetchNotifications]);

  useEffect(() => {
    if (!isCheckingRole && !error && userData?.role) {
      const redirects = {
        project_manager: "/pm-projects",
        ambassador: "/ambassadors",
        jury_secretary: "/jury-secretary",
        jury_member: "/jury",
      };
      const targetPath = redirects[userData.role];
      if (targetPath) navigate(targetPath, { replace: true });
    }
  }, [isCheckingRole, error, userData?.role, navigate]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={250} style={styles.sider}>
        <div style={styles.logo}>
          <Title level={4} style={styles.logoText}>Avtologistika</Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
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
          style={styles.menu}
        />
      </Sider>

      <Layout style={{ marginLeft: 250 }}>
        <Content style={styles.content}>
          {isCheckingRole ? (
            <Title level={3}>⏳ Завантаження...</Title>
          ) : error ? (
            <Title level={3} type="danger">❌ {error}</Title>
          ) : (
            <Card hoverable style={styles.card} bodyStyle={{ padding: "24px" }}>
              <Card.Meta
                avatar={
                  <Avatar
                    size={72}
                    src={userData.profilePicture || null}
                    icon={!userData.profilePicture && <UserOutlined />}
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                }
                title={
                  <Title level={4} style={{ marginBottom: 0 }}>
                    {`${userData.firstName} ${userData.lastName}`.trim() || "Користувач"}
                  </Title>
                }
                description={
                  <Text style={{ color: "#8c8c8c", fontSize: "16px" }}>
                    Роль: {userData.role}
                  </Text>
                }
              />
              <Space direction="vertical" size="large" style={{ marginTop: "24px" }}>
                <Form
                  form={form}
                  initialValues={{
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    phone: userData.phone,
                  }}
                  layout="vertical"
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
                  <AntButton
                    type="primary"
                    icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    style={{ width: "100%" }}
                  >
                    {isEditing ? "Зберегти зміни" : "Редагувати дані"}
                  </AntButton>
                )}
              </Space>

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
                    <AntButton onClick={markAllAsRead}>
                      Позначити всі як прочитані
                    </AntButton>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

const styles = {
  sider: {
    background: "#002140",
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    height: "100vh",
    zIndex: 1000,
    borderRight: "1px solid #001f3f",
  },
  logo: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#002140",
    borderBottom: "1px solid #001f3f",
  },
  logoText: {
    color: "#ffffff",
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
  },
  menu: {
    marginTop: 20,
  },
  content: {
    padding: "30px",
    paddingLeft: "50px",
    paddingRight: "50px",
    background: "#f4f6f9",
    minHeight: "100vh",
    position: "relative",
  },
  card: {
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    background: "#fff",
    maxWidth: "600px",
    width: "100%",
    margin: "0 auto",
  },
  notificationIconWrapper: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 2000,
  },
};

export default WorkerPage;
