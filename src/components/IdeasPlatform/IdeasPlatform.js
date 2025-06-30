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
  theme
} from "antd";
import { useNavigate } from "react-router-dom";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text }     = Typography;

const API_PROBLEM_URL = "https://backend-avtologistika.onrender.com/api/problems";

const IdeasSubmissionPage = () => {
  const [problems, setProblems]         = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);
  const [isDarkMode, setIsDarkMode]     = useState(localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();
  const getAuthToken = () => localStorage.getItem("token");

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  /* отримуємо проблеми користувача */
  const fetchUserProblems = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Необхідна авторизація.");
      const { status, data } = await axios.get(`${API_PROBLEM_URL}/user-problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status === 200 && Array.isArray(data)) setProblems(data);
      else throw new Error(data.message || "Не вдалося отримати проблеми.");
    } catch (err) {
      setError(err.response?.data?.message || "Не вдалося завантажити проблеми.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProblems();
  }, [fetchUserProblems]);

  /* колір тегу-статусу */
  const getStatusColor = (status) => ({
    pending : "orange",
    approved: "green",
    rejected: "red",
  }[status] || "blue");

  /* тема */
  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token    : {
      colorPrimary  : "#1E63F2",
      borderRadius  : 12,
      fontFamily    : "Roboto, sans-serif",
      colorTextBase : isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout   : isDarkMode ? "#121212" : "#F4F6F8",
      colorBorder     : isDarkMode ? "#2C313A" : "#DDE1E6",
    },
  };

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header style={{ background: "transparent", height: 30, padding: 0 }} />

        {/* Тема + Назад */}
        <div style={{ display: "flex", gap: 12, paddingLeft: 20, marginTop: 70 }}>
          <div onClick={toggleTheme} style={{ cursor: "pointer", fontSize: 20, color: themeMode.token.colorTextBase }}>
            {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
          </div>
          <Button type="link" onClick={() => navigate("/worker")} style={{ fontSize: 16, paddingLeft: 0 }}>
            Назад
          </Button>
        </div>

        <Content style={{ padding: "30px 20px", maxWidth: 900, margin: "0 auto" }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 40, color: themeMode.token.colorTextBase }}>
            Мої подані проблеми
          </Title>

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
                    title={
                      <Title level={4} style={{ marginBottom: 0, color: themeMode.token.colorTextBase }}>
                        {problem.title || "Без назви"}
                      </Title>
                    }
                    style={{
                      borderRadius: 12,
                      boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.4)" : "0 4px 10px rgba(0,0,0,0.1)",
                      background: themeMode.token.colorBgContainer,
                    }}
                    bordered={false}
                  >
                    <Text style={{ color: themeMode.token.colorTextBase }}>
                      {problem.description || "Без опису"}
                    </Text>
                    <br />
                    <Tag color={getStatusColor(problem.status)} style={{ marginTop: 10 }}>
                      {problem.status ? problem.status.toUpperCase() : "НЕ ВКАЗАНО"}
                    </Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      Автор:{" "}
                      {problem.author_first_name && problem.author_last_name
                        ? `${problem.author_first_name} ${problem.author_last_name}`
                        : "Невідомий"}
                    </Text>
                    <br />
                    <Button
                      type="primary"
                      style={{ marginTop: 10 }}
                      onClick={() =>
                        navigate("/blog", {
                          state: {
                            entryType: "problem",
                            entryId  : problem.id,
                          },
                        })
                      }
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
