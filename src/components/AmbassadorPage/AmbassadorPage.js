import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Layout, Card, Typography, message, Spin, Button, Input, List } from "antd";

const { Title } = Typography;

// ✅ API-шляхи
const API_BASE = "http://192.168.0.116:5000/api/ambassadorRoutes";
const API_PROFILE = `${API_BASE}/profile`;
const API_SELECTED_IDEAS = "http://192.168.0.116:5000/api/ideaRoutes/selected-ambassador-ideas"; 
const API_FEEDBACK = "http://192.168.0.116:5000/api/feedbackRoutes"; 

const AmbassadorProfile = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState(null);
  const [loadingSelectedIdeas, setLoadingSelectedIdeas] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAmbassador = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        throw new Error("❌ Необхідно авторизуватися.");
      }
      const response = await axios.get(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data) {
        setAmbassador(response.data);
      } else {
        throw new Error("❌ Амбасадора не знайдено.");
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
    if (!ambassador) return;
    try {
      setLoadingSelectedIdeas(true);
      const token = getAuthToken();
      if (!token) {
        throw new Error("❌ Необхідно авторизуватися.");
      }
      const response = await axios.get(`${API_SELECTED_IDEAS}/${ambassador.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data) {
        setSelectedIdeas(response.data);
      } else {
        throw new Error("❌ Ідеї, де амбасадора обрано, не знайдено.");
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА ОТРИМАННЯ ВИБРАНИХ ІДЕЙ:", err.message);
      message.error(err.message || "❌ Сталася помилка при отриманні вибраних ідей.");
    } finally {
      setLoadingSelectedIdeas(false);
    }
  };

  const fetchComments = async (ideaId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_FEEDBACK}/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { idea_id: ideaId },
      });
      if (response.status === 200) {
        setComments((prev) => ({
          ...prev,
          [ideaId]: response.data,
        }));
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
    if (!ideaId) {
      message.error("❌ Необхідно вказати ID ідеї.");
      return;
    }
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_FEEDBACK}/add`,
        { idea_id: ideaId, text: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("✅ Коментар успішно додано.");
      setNewComment("");
      fetchComments(ideaId); // Оновлення коментарів після додавання нового
    } catch (error) {
      console.error("❌ ПОМИЛКА ДОДАВАННЯ КОМЕНТАРЯ", error.message);
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleSelectIdea = (ideaId) => {
    setSelectedIdeaId(ideaId); // Зберігаємо вибрану ідею
    fetchComments(ideaId); // Завантажуємо коментарі для цієї ідеї
  };

  const handleShowDetails = () => {
    setShowDetails((prev) => !prev);
    if (!selectedIdeas && !loadingSelectedIdeas) {
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
        <Card title={`Амбасадор: ${ambassador.first_name} ${ambassador.last_name}`}>
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
              ) : selectedIdeas && selectedIdeas.length > 0 ? (
                selectedIdeas.map((idea) => (
                  <Card key={idea.id} style={{ marginTop: "10px" }}>
                    <p><strong>Назва:</strong> {idea.title}</p>
                    <p><strong>Опис:</strong> {idea.description}</p>
                    <p><strong>Статус:</strong> {idea.status}</p>
                    <p><strong>Автор:</strong> {idea.author_name} ({idea.author_email})</p>
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
                <p>Немає ідей.</p>
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
