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
      if (!token) throw new Error("\u274c \u041d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u043e \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0443\u0432\u0430\u0442\u0438\u0441\u044f.");
      const response = await axios.get(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && response.data?.id) {
        setAmbassador(response.data);
      } else {
        throw new Error("\u274c \u0410\u043c\u0431\u0430\u0441\u0430\u0434\u043e\u0440\u0430 \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e \u0430\u0431\u043e \u0432\u0456\u0434\u0441\u0443\u0442\u043d\u0456\u0439 ID.");
      }
    } catch (err) {
      message.error(err.message || "\u274c \u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0440\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043d\u0456 \u0430\u043c\u0431\u0430\u0441\u0430\u0434\u043e\u0440\u0430.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSelectedIdeas = async () => {
    if (!ambassador?.user_id) return;
    try {
      setLoadingSelectedIdeas(true);
      const response = await axios.get(`${AMBASSADOR_API}/${ambassador.user_id}/ideas`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setSelectedIdeas(response.data);
      } else {
        setSelectedIdeas([]);
      }
    } catch (err) {
      setSelectedIdeas([]);
      message.error(err.message || "\u274c \u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0440\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043d\u0456 \u0456\u0434\u0435\u0439");
    } finally {
      setLoadingSelectedIdeas(false);
    }
  };

  const fetchComments = async (ideaId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_FEEDBACK}/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { idea_id: ideaId },
      });
      if (response.status === 200) {
        setComments((prev) => ({ ...prev, [ideaId]: response.data }));
      } else {
        message.error("\u274c \u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456.");
      }
    } catch (error) {
      message.error("\u274c \u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0440\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043d\u0456 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456\u0432.");
    }
  };

  const handleAddComment = async (ideaId) => {
    if (!newComment.trim()) {
      message.error("\u274c \u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440 \u043d\u0435 \u043c\u043e\u0436\u0435 \u0431\u0443\u0442\u0438 \u043f\u043e\u0440\u043e\u0436\u043d\u0456\u043c.");
      return;
    }
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_FEEDBACK}/add`,
        { idea_id: ideaId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("\u2705 \u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440 \u0443\u0441\u043f\u0456\u0448\u043d\u043e \u0434\u043e\u0434\u0430\u043d\u043e.");
      setNewComment("");
      fetchComments(ideaId);
    } catch (error) {
      message.error("\u274c \u0421\u0442\u0430\u043b\u0430\u0441\u044f \u043f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0440\u0438 \u0434\u043e\u0434\u0430\u0432\u0430\u043d\u043d\u0456 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u044f.");
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
        <Title level={3}>\u23f3 \u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f...</Title>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: "20px", textAlign: "center" }}>
        <Title level={3} style={{ color: "red" }}>\u274c {error}</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: "20px" }}>
      {ambassador ? (
        <Card
          title={`Амбасадор: ${ambassador.first_name} ${ambassador.last_name}`}
          extra={<Button onClick={() => navigate("/worker")}>\u2190 \u041d\u0430\u0437\u0430\u0434</Button>}
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
        <Title level={4} style={{ color: "gray" }}>\ud83d\udceb Інформація про амбасадора відсутня</Title>
      )}
    </Layout>
  );
};

export default AmbassadorProfile;
