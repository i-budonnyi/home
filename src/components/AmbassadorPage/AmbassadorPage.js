import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Layout, Card, Typography, message, Spin, Button, Input, List } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const AMBASSADOR_API = `${API_BASE}/ambassadorRoutes`;
const API_PROFILE = `${AMBASSADOR_API}/profile`;
const API_FEEDBACK = `${API_BASE}/feedbackRoutes`;

const AmbassadorProfile = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [loadingSelectedIdeas, setLoadingSelectedIdeas] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAmbassador = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error("❌ Необхідно авторизуватися.");
      console.log("[FRONT] 🔐 Запит профілю амбасадора...");
      const response = await axios.get(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[FRONT] ✅ Отримано профіль:", response.data);
      if (response.status === 200 && response.data?.id) {
        setAmbassador(response.data);
      } else {
        throw new Error("❌ Амбасадора не знайдено або відсутній ID.");
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА ОТРИМАННЯ АМБАСАДОРА:", err.message);
      message.error(err.message || "❌ Сталася помилка при отриманні амбасадора.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSelectedIdeas = async () => {
    if (!ambassador?.id) return;
    try {
      setLoadingSelectedIdeas(true);
      console.log(`[FRONT] 📡 Отримуємо ідеї для амбасадора ID=${ambassador.id}`);
      const response = await axios.get(`${AMBASSADOR_API}/${ambassador.id}/ideas`);
      console.log("[FRONT] ✅ Отримано ідеї:", response.data);
      if (response.status === 200 && Array.isArray(response.data)) {
        setSelectedIdeas(response.data);
      } else {
        setSelectedIdeas([]);
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА ВІДПОВІДІ ІДЕЙ:", err.message);
      setSelectedIdeas([]);
      message.error(err.message || "❌ Сталася помилка при отриманні ідей");
    } finally {
      setLoadingSelectedIdeas(false);
    }
  };

  const fetchComments = async (ideaId) => {
    try {
      const token = getAuthToken();
      console.log("[FRONT] 💬 Отримуємо коментарі для ідеї:", ideaId);
      const response = await axios.get(`${API_FEEDBACK}/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { idea_id: ideaId },
      });
      console.log("[FRONT] ✅ Коментарі:", response.data);
      if (response.status === 200) {
        setComments((prev) => ({ ...prev, [ideaId]: response.data }));
      } else {
        message.error("❌ Не вдалося завантажити коментарі.");
      }
    } catch (error) {
      console.error("❌ ПОМИЛКА ОТРИМАННЯ КОМЕНТАРІВ", error.message);
      message.error("❌ Сталася помилка при отриманні коментарів.");
    }
  };

  const handleAddComment = async (ideaId) => {
    if (!newComment.trim()) {
      message.error("❌ Коментар не може бути порожнім.");
      return;
    }
    try {
      const token = getAuthToken();
      console.log("[FRONT] ✏️ Додаємо коментар до ідеї ID:", ideaId);
      await axios.post(
        `${API_FEEDBACK}/add`,
        { idea_id: ideaId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Коментар успішно додано.");
      setNewComment("");
      fetchComments(ideaId);
    } catch (error) {
      console.error("❌ ПОМИЛКА ДОДАВАННЯ КОМЕНТАРЯ", error.message);
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleSelectIdea = (ideaId) => {
    setSelectedIdeaId(ideaId);
    fetchComments(ideaId);
  };

  const handleShowDetails = () => {
    setShowDetails((prev) => !prev);
    if (!selectedIdeas.length && !loadingSelectedIdeas) {
      fetchSelectedIdeas();
    }
  };

  useEffect(() => {
    fetchAmbassador();
  }, [fetchAmbassador]);

  if (loading) {
    return (
      <Layout style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" />
        <Title level={3}>⏳ Завантаження...</Title>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: "20px", textAlign: "center" }}>
        <Title level={3} style={{ color: "red" }}>❌ {error}</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: "20px" }}>
      {ambassador ? (
        <Card
          title={`Амбасадор: ${ambassador.first_name} ${ambassador.last_name}`}
          extra={<Button onClick={() => navigate("/worker")}>← Назад</Button>}
        >
          <p><strong>Email:</strong> {ambassador.email}</p>
          <p><strong>Телефон:</strong> {ambassador.phone}</p>
          <p><strong>Посада:</strong> {ambassador.position || "Не вказано"}</p>

          <Button type="primary" onClick={handleShowDetails} loading={loadingSelectedIdeas}>
            {showDetails ? "Сховати деталі" : "Показати ідеї"}
          </Button>

          {showDetails && (
            <>
              <p><strong>ID користувача:</strong> {ambassador.user_id}</p>
              <p><strong>Коментарі:</strong> {ambassador.comments || "Немає"}</p>
              <p><strong>Статус:</strong> {ambassador.status || "Не визначено"}</p>
              <hr />

              <Title level={4}>Ідеї, де обрали цього амбасадора</Title>
              {loadingSelectedIdeas ? (
                <Spin size="small" />
              ) : selectedIdeas.length > 0 ? (
                selectedIdeas.map((idea) => (
                  <Card key={idea.id} style={{ marginTop: "10px" }}>
                    <p><strong>Назва:</strong> {idea.title}</p>
                    <p><strong>Опис:</strong> {idea.description}</p>
                    <p><strong>Статус:</strong> {idea.status}</p>
                    <p><strong>Автор (user_id):</strong> {idea.user_id ?? "Невідомо"}</p>
                    <Button onClick={() => handleSelectIdea(idea.id)}>Показати коментарі</Button>

                    {selectedIdeaId === idea.id && (
                      <>
                        <Title level={5}>Коментарі</Title>
                        <List
                          dataSource={comments[selectedIdeaId] || []}
                          renderItem={(item) => (
                            <List.Item>
                              <Card>
                                <p><strong>{item.sender_first_name} {item.sender_last_name}</strong></p>
                                <p>{item.text}</p>
                              </Card>
                            </List.Item>
                          )}
                        />
                        <Input.TextArea
                          rows={4}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
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
                ))
              ) : (
                <p>Цей амбасадор ще не має ідей.</p>
              )}
            </>
          )}
        </Card>
      ) : (
        <Title level={4} style={{ color: "gray" }}>📭 Інформація про амбасадора відсутня</Title>
      )}
    </Layout>
  );
};

export default AmbassadorProfile;
