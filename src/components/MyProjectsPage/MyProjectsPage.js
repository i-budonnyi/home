import React, { useEffect, useState, useCallback } from "react"; // 🔥 додали useCallback
import axios from "axios";
import { Layout, List, Card, Typography, Skeleton, Alert, Button, Tag, Input, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Header, Content } = Layout;
const { TextArea } = Input;

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

  // 🔥 Обгорнули fetchUserIdeas у useCallback
  const fetchUserIdeas = useCallback(async () => {
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
  }, []); // 🔥 можна залишити пусто, бо validateAuthToken не змінюється

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
  }, [fetchUserIdeas]); // 🔥 тепер залежність правильна!

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      {/* решта твого коду */}
    </Layout>
  );
};

export default MyProjectsPage;
