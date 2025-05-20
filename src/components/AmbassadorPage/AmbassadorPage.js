import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  Card,
  Typography,
  message,
  Spin,
  Button,
  Input,
  List,
} from "antd";

const { Title } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api/ambassadorRoutes";
const API_PROFILE = `${API_BASE}/profile`;
const API_SELECTED_IDEAS =
  "https://backend-avtologistika.onrender.com/api/ideaRoutes/selected-ambassador-ideas";
const API_FEEDBACK =
  "https://backend-avtologistika.onrender.com/api/feedbackRoutes";

const AmbassadorProfile = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchAmbassador = useCallback(async () => {
    try {
      if (!token) throw new Error("Авторизуйтесь для перегляду профілю.");
      const res = await axios.get(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.id) {
        setAmbassador(res.data);
      } else throw new Error("Амбасадора не знайдено");
    } catch (err) {
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchIdeas = useCallback(async () => {
    if (!ambassador?.id) return;
    try {
      setLoadingIdeas(true);
      const res = await axios.get(`${API_SELECTED_IDEAS}/${ambassador.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setSelectedIdeas(res.data);
      }
    } catch (err) {
      message.error("Помилка завантаження ідей: " + err.message);
    } finally {
      setLoadingIdeas(false);
    }
  }, [ambassador, token]);

  const fetchComments = async (ideaId) => {
    try {
      const res = await axios.get(`${API_FEEDBACK}/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { idea_id: ideaId },
      });
      setComments((prev) => ({ ...prev, [ideaId]: res.data }));
    } catch (err) {
      message.error("Помилка при завантаженні коментарів");
    }
  };

  const handleAddComment = async (ideaId) => {
    if (!newComment.trim()) return message.error("Коментар порожній");
    try {
      await axios.post(
        `${API_FEEDBACK}/add`,
        { idea_id: ideaId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Коментар додано");
      setNewComment("");
      fetchComments(ideaId);
    } catch (err) {
      message.error("Помилка при додаванні коментаря");
    }
  };

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
    if (!selectedIdeas.length) fetchIdeas();
  };

  useEffect(() => {
    fetchAmbassador();
  }, [fetchAmbassador]);

  if (loading) {
    return (
      <Layout style={{ padding: 20, textAlign: "center" }}>
        <Spin size="large" />
        <Title level={3}>Завантаження...</Title>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: 20, textAlign: "center" }}>
        <Title level={4} style={{ color: "red" }}>{error}</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: 20 }}>
      <Card title={`Амбасадор: ${ambassador.first_name} ${ambassador.last_name}`}>
        <p><strong>Email:</strong> {ambassador.email}</p>
        <p><strong>Телефон:</strong> {ambassador.phone}</p>
        <p><strong>Посада:</strong> {ambassador.position || "Не вказано"}</p>
        <Button type="primary" onClick={toggleDetails} loading={loadingIdeas}>
          {showDetails ? "Сховати деталі" : "Показати ідеї"}
        </Button>

        {showDetails && (
          <>
            <hr />
            <Title level={4}>Ідеї, де обрали цього амбасадора</Title>
            {loadingIdeas ? (
              <Spin />
            ) : selectedIdeas.length > 0 ? (
              selectedIdeas.map((idea) => (
                <Card key={idea.id} style={{ marginTop: 10 }}>
                  <p><strong>Назва:</strong> {idea.title}</p>
                  <p><strong>Опис:</strong> {idea.description}</p>
                  <p><strong>Статус:</strong> {idea.status}</p>
                  <p><strong>Автор:</strong> {idea.author_name} ({idea.author_email})</p>
                  <Button onClick={() => {
                    setSelectedIdeaId(idea.id);
                    fetchComments(idea.id);
                  }}>Показати коментарі</Button>

                  {selectedIdeaId === idea.id && (
                    <>
                      <Title level={5}>Коментарі</Title>
                      <List
                        dataSource={comments[idea.id] || []}
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
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Напишіть коментар"
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
              ))
            ) : (
              <p>Немає ідей або не вдалося завантажити.</p>
            )}
          </>
        )}
      </Card>
    </Layout>
  );
};

export default AmbassadorProfile;
