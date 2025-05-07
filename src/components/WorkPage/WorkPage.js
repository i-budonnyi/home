import React, { useEffect, useState } from "react";
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
} from "@ant-design/icons";
import axios from "axios";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

const API_BASE_URL = "https://backend-avtologistika.onrender.com/api/userRoutes";

const WorkerPage = () => {
  const [userData, setUserData] = useState(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/profile`, {
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
        });
      } catch (err) {
        setError(err.response?.data?.message || "Сталася помилка");
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

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

  const fetchNotifications = async () => {
    if (!userData?.id) return;
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`https://backend-avtologistika.onrender.com/api/notifications/${userData.id}`);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("❌ Сповіщення:", err.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(
        unread.map((n) =>
          axios.patch(`https://backend-avtologistika.onrender.com/api/notifications/${n.id}/read`)
        )
      );
      fetchNotifications();
    } catch (err) {
      console.error("❌ markAllAsRead:", err.message);
    }
  };

  useEffect(() => {
    if (userData?.id) fetchNotifications();
  }, [userData]);

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
          <div style={styles.notificationIconWrapper}>
            <Dropdown
              trigger={["click"]}
              overlayStyle={{ width: 300 }}
              dropdownRender={() => (
                <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
                  <List
                    dataSource={notifications}
                    loading={loadingNotifications}
                    locale={{ emptyText: "Немає сповіщень" }}
                    renderItem={(item) => (
                      <List.Item style={{ opacity: item.is_read ? 0.6 : 1 }}>
                        <Text>{item.message}</Text>
                      </List.Item>
                    )}
                  />
                  {notifications.length > 0 && (
                    <div style={{ marginTop: 10, textAlign: "center" }}>
                      <AntButton type="link" onClick={markAllAsRead}>
                        Позначити всі як прочитані
                      </AntButton>
                    </div>
                  )}
                </div>
              )}
            >
              <Badge count={notifications.filter((n) => !n.is_read).length}>
                <BellOutlined style={{ fontSize: 24, color: "#1890ff", cursor: "pointer" }} />
              </Badge>
            </Dropdown>
          </div>

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
                {userData.phone && (
                  <Text><PhoneOutlined style={styles.icon} /> {userData.phone}</Text>
                )}
                {userData.email && (
                  <Text><MailOutlined style={styles.icon} /> {userData.email}</Text>
                )}
              </Space>
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
    maxWidth: "500px",
    width: "100%",
    margin: "0 auto",
  },
  icon: {
    marginRight: "8px",
    color: "#1890ff",
  },
  notificationIconWrapper: {
    position: "fixed",
    bottom: 20,
    right: 20,
    zIndex: 2000,
  },
};

export default WorkerPage;
