import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Input,
  message,
  ConfigProvider,
  theme,
} from "antd";
import { useNavigate } from "react-router-dom";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;

const API_IDEA_URL = "https://backend-avtologistika.onrender.com/api/ideaRoutes";
const API_FEEDBACK_URL = "https://backend-avtologistika.onrender.com/api/feedbackRoutes";

const MyProjectsPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const navigate = useNavigate();
  const getAuthToken = () => localStorage.getItem("token");

  const currentUserId = useMemo(() => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("theme", newTheme);
  };

  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1E63F2",
      borderRadius: 12,
      fontFamily: "Roboto, sans-serif",
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout: isDarkMode ? "#121212" : "#F4F6F8",
      colorBorder: isDarkMode ? "#2C313A" : "#DDE1E6",
    },
  };

  const validateAuthToken = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      setError("Необхідно авторизуватися.");
      setIsLoading(false);
      return false;
    }
    return token;
  }, []);

  const fetchComments = useCallback(async (ideaId, token) => {
    try {
      const response = await axios.get(`${API_FEEDBACK_URL}/list?idea_id=${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setComments((prev) => ({
          ...prev,
          [ideaId]: response.data.length > 0
            ? response.data
            : [{ text: "Коментарів поки що немає." }],
        }));
      }
    } catch {
      setComments((prev) => ({
        ...prev,
        [ideaId]: [{ text: "Помилка завантаження коментарів." }],
      }));
    }
  }, []);

  const fetchUserIdeas = useCallback(async () => {
    try {
      const token = validateAuthToken();
      if (!token) return;

      const response = await axios.get(`${API_IDEA_URL}/user-ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setIdeas(response.data);
        response.data.forEach((idea) => fetchComments(idea.id, token));
      }
    } catch {
      setError("Не вдалося завантажити ваші ідеї.");
    } finally {
      setIsLoading(false);
    }
  }, [validateAuthToken, fetchComments]);

  const handleAddComment = async (ideaId) => {
    if (!commentText[ideaId]?.trim()) {
      message.error("❌ Коментар не може бути порожнім.");
      return;
    }

    const token = getAuthToken();
    try {
      await axios.post(
        `${API_FEEDBACK_URL}/add`,
        { idea_id: ideaId, text: commentText[ideaId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Коментар успішно додано.");
      setCommentText((prev) => ({ ...prev, [ideaId]: "" }));
      fetchComments(ideaId, token);
    } catch {
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleSelectIdea = (idea) => {
    localStorage.setItem("selectedIdea", JSON.stringify(idea));
    navigate(`/applications/${idea.id}`);
  };

  const formatName = (comment) => {
    if (comment.sender_id === currentUserId) return "Ви";
    if (comment.sender_first_name) return `${comment.sender_first_name} ${comment.sender_last_name || ""}`;
    if (comment.sender_id) return `🕵️ User-${String(comment.sender_id).padStart(3, "0")}`;
    return "Анонім";
  };

  useEffect(() => {
    fetchUserIdeas();
  }, [fetchUserIdeas]);

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Header style={{ background: "transparent", padding: "0" }} />
        <Content style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 16,
              marginBottom: 30,
            }}
          >
            <div
              onClick={toggleTheme}
              style={{ cursor: "pointer", fontSize: 20, color: themeMode.token.colorTextBase }}
              title="Перемкнути тему"
            >
              {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </div>

            <Button type="link" onClick={() => navigate("/worker")} style={{ fontSize: 16 }}>
              Назад
            </Button>
          </div>

          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: 40, color: themeMode.token.colorTextBase }}
          >
            Мої подані ідеї
          </Title>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 20 }} />}

          {isLoading ? (
            <Skeleton active />
          ) : (
            <List
              grid={{ gutter: 20, column: 1 }}
              dataSource={ideas}
              renderItem={(idea) => (
                <List.Item>
                  <Card
                    hoverable
                    title={
                      <Title level={4} style={{ marginBottom: 0, color: themeMode.token.colorTextBase }}>
                        {idea.title || "Без назви"}
                      </Title>
                    }
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      background: themeMode.token.colorBgContainer,
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(0,0,0,0.4)"
                        : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                    bordered={false}
                  >
                    <Text style={{ color: themeMode.token.colorTextBase }}>
                      {idea.description || "Без опису"}
                    </Text>
                    <br />
                    <Tag
                      color={
                        idea.status === "approved"
                          ? "green"
                          : idea.status === "pending"
                          ? "orange"
                          : idea.status === "applied"
                          ? "blue"
                          : "red"
                      }
                      style={{ marginTop: 10 }}
                    >
                      {idea.status?.toUpperCase()}
                    </Tag>
                    <br />
                    {idea.status === "applied" ? (
                      <Tag color="blue" style={{ marginTop: 10 }}>📨 Заявку вже подано</Tag>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => handleSelectIdea(idea)}
                        style={{ marginTop: 10 }}
                      >
                        📌 Відкрити заявку
                      </Button>
                    )}

                    {comments[idea.id] && (
                      <>
                        <List
                          bordered
                          style={{ marginTop: 15 }}
                          dataSource={comments[idea.id]}
                          renderItem={(comment) => (
                            <List.Item>
                              <Text strong>{formatName(comment)}</Text>: {comment.text}
                            </List.Item>
                          )}
                        />
                        <TextArea
                          rows={4}
                          value={commentText[idea.id] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [idea.id]: e.target.value }))
                          }
                          placeholder="Напишіть ваш коментар..."
                          style={{ marginTop: 10 }}
                        />
                        <Button
                          type="primary"
                          onClick={() => handleAddComment(idea.id)}
                          style={{ marginTop: 10 }}
                        >
                          Додати коментар
                        </Button>
                      </>
                    )}
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

export default MyProjectsPage;
