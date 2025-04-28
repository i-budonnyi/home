import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, List, Card, Typography, Skeleton, Alert, Button, Tag, Input, message } from "antd"; // 🔥 Form видалено
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;

// ✅ НОВІ правильні шляхи
const API_IDEA_URL = "https://idea-backend.onrender.com/api/ideaRoutes";
const API_FEEDBACK_URL = "https://idea-backend.onrender.com/api/feedbackRoutes";

const MyProjectsPage = () => {
  const [ideas, setIdeas] = useState([]);
  const [comments, setComments] = useState({});
  const [ideaAuthors, setIdeaAuthors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("token");

  const validateAuthToken = () => {
    const token = getAuthToken();
    if (!token) {
      setError("Необхідно авторизуватися.");
      setIsLoading(false);
      return false;
    }
    return token;
  };

  const fetchUserIdeas = async () => {
    try {
      const token = validateAuthToken();
      if (!token) return;

      const response = await axios.get(`${API_IDEA_URL}/user-ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setIdeas(response.data);
        response.data.forEach((idea) => {
          fetchComments(idea.id, token);
          fetchIdeaAuthor(idea.id, token);
        });
      }
    } catch {
      setError("Не вдалося завантажити ваші ідеї.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIdeaAuthor = async (ideaId, token) => {
    try {
      const response = await axios.get(`${API_IDEA_URL}/idea-author?idea_id=${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setIdeaAuthors((prev) => ({ ...prev, [ideaId]: response.data }));
      }
    } catch {
      setIdeaAuthors((prev) => ({ ...prev, [ideaId]: { first_name: "Невідомий", last_name: "" } }));
    }
  };

  const fetchComments = async (ideaId, token) => {
    try {
      const response = await axios.get(`${API_FEEDBACK_URL}/list?idea_id=${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setComments((prev) => ({
          ...prev,
          [ideaId]: response.data.length > 0 ? response.data : [{ text: "Коментарів поки що немає." }],
        }));
      }
    } catch {
      setComments((prev) => ({
        ...prev,
        [ideaId]: [{ text: "Помилка завантаження коментарів." }],
      }));
    }
  };

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
    } catch (error) {
      console.error("❌ ПОМИЛКА ДОДАВАННЯ КОМЕНТАРЯ", error.message);
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleSelectIdea = (idea) => {
    console.log("📌 Обрано ідею:", idea);
    localStorage.setItem("selectedIdea", JSON.stringify(idea));
    navigate(`/applications/${idea.id}`);
  };

  useEffect(() => {
    fetchUserIdeas();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "15px" }}>
        <Title style={{ color: "white", fontSize: "24px" }}>Мої подані ідеї</Title>
      </Header>
      <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
        {error && <Alert message={error} type="error" showIcon />}
        {isLoading ? (
          <Skeleton active />
        ) : (
          <List
            grid={{ gutter: 20, column: 1 }}
            dataSource={ideas}
            renderItem={(idea) => (
              <List.Item>
                <Card hoverable title={<Title level={4}>{idea.title}</Title>} style={{ width: "100%" }}>
                  <Text strong>Автор:</Text> {ideaAuthors[idea.id]?.first_name} {ideaAuthors[idea.id]?.last_name}
                  <br />
                  <Tag color={idea.status === "approved" ? "green" : idea.status === "pending" ? "orange" : "red"}>
                    {idea.status.toUpperCase()}
                  </Tag>
                  <br />
                  <Text>{idea.description || "Без опису"}</Text>
                  <br />
                  <Button type="primary" onClick={() => handleSelectIdea(idea)}>
                    📌 Відкрити заявку
                  </Button>
                  <Button type="link" onClick={() => fetchComments(idea.id, getAuthToken())}>
                    Показати коментарі
                  </Button>
                  {comments[idea.id] && (
                    <>
                      <List
                        bordered
                        dataSource={comments[idea.id]}
                        renderItem={(comment) => (
                          <List.Item>
                            <Text strong>
                              {comment.sender_first_name} {comment.sender_last_name}:
                            </Text>{" "}
                            {comment.text}
                          </List.Item>
                        )}
                      />
                      <TextArea
                        rows={4}
                        value={commentText[idea.id] || ""}
                        onChange={(e) => setCommentText((prev) => ({ ...prev, [idea.id]: e.target.value }))}
                        placeholder="Напишіть ваш коментар..."
                      />
                      <Button
                        type="primary"
                        onClick={() => handleAddComment(idea.id)}
                        style={{ marginTop: "10px" }}
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
  );
};

export default MyProjectsPage;
