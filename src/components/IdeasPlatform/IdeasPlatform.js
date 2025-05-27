import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  List,
  Card,
  Typography,
  Skeleton,
  Alert,
  Button,
  Tag,
  ConfigProvider,
  theme,
  Switch,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_PROBLEM_URL = "https://backend-avtologistika.onrender.com/api/problems";

const IdeasSubmissionPage = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserProblems = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("❌ Потрібна авторизація.");

      const response = await axios.get(`${API_PROBLEM_URL}/user-problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setProblems(response.data);
      } else {
        throw new Error(response.data.message || "Помилка при завантаженні.");
      }
    } catch (err) {
      console.error("❌ fetchUserProblems:", err);
      setError(err.response?.data?.message || err.message || "Помилка.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProblems();
  }, [fetchUserProblems]);

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

  const toggleTheme = () => {
    const next = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", next);
  };

  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1E63F2",
      fontFamily: "Roboto, sans-serif",
      borderRadius: 10,
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout: isDarkMode ? "#121212" : "#F4F6F8",
    },
  };

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header
          style={{
            background: "transparent",
            padding: "32px 20px 10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Space style={{ marginBottom: 16 }}>
            <Switch
              checked={!isDarkMode}
              onChange={toggleTheme}
              checkedChildren={<SunOutlined />}
              unCheckedChildren={<MoonOutlined />}
            />
          </Space>
          <Title level={3} style={{ color: themeMode.token.colorTextBase, margin: 0 }}>
            Мої подані проблеми
          </Title>
        </Header>

        <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />
          )}

          {isLoading ? (
            <Skeleton active />
          ) : (
            <List
              grid={{ gutter: 20, column: 1 }}
              dataSource={problems}
              renderItem={(problem) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      background: themeMode.token.colorBgContainer,
                    }}
                    title={
                      <Title level={4} style={{ marginBottom: 0 }}>
                        {problem.title || "Без назви"}
                      </Title>
                    }
                  >
                    <Text>{problem.description || "Без опису"}</Text>
                    <br />
                    <Tag
                      color={getStatusColor(problem.status)}
                      style={{ marginTop: "10px", fontSize: "14px" }}
                    >
                      {problem.status?.toUpperCase() || "НЕ ВКАЗАНО"}
                    </Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: "14px" }}>
                      Автор:{" "}
                      {problem.author_first_name && problem.author_last_name
                        ? `${problem.author_first_name} ${problem.author_last_name}`
                        : "Невідомий"}
                    </Text>
                    <br />
                    <Button
                      type="primary"
                      onClick={() => navigate(`/problem/${problem.id}`)}
                      style={{ marginTop: 10 }}
                    >
                      Детальніше
                    </Button>
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

export default IdeasSubmissionPage;
