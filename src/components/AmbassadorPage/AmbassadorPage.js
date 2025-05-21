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
  Select,
} from "antd";

const { Title } = Typography;
const { Option } = Select;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const AMBASSADOR_API = `${API_BASE}/ambassadorRoutes`;
const API_PROFILE = `${AMBASSADOR_API}/profile`;
const API_FEEDBACK = `${API_BASE}/feedbackRoutes`;
const API_UPDATE_STATUS = `${AMBASSADOR_API}/update-status`;

const AmbassadorPage = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedIdeas, setSelectedIdeas] = useState([]);
  const [loadingSelectedIdeas, setLoadingSelectedIdeas] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchAmbassador = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) throw new Error("❌ Необхідно авторизуватися.");
      const { data, status } = await axios.get(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status === 200 && data?.id) {
        setAmbassador(data);
      } else {
        throw new Error("❌ Амбасадора не знайдено або відсутній ID.");
      }
    } catch (err) {
      message.error(err.message || "❌ Сталася помилка при отриманні амбасадора.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSelectedIdeas = async () => {
    if (!ambassador?.user_id) return;
    try {
      setLoadingSelectedIdeas(true);
      const token = getAuthToken();
      const { data } = await axios.get(`${AMBASSADOR_API}/${ambassador.user_id}/ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedIdeas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Помилка при отриманні ідей:", err);
      setSelectedIdeas([]);
      message.error("❌ Сталася помилка при отриманні ідей");
    } finally {
      setLoadingSelectedIdeas(false);
    }
  };

  const fetchComments = async (ideaId) => {
    try {
      const token = getAuthToken();
      const { data } = await axios.get(`${API_FEEDBACK}/list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { idea_id: ideaId },
      });
      setComments((prev) => ({ ...prev, [ideaId]: data }));
    } catch (error) {
      console.error("❌ Сталася помилка при отриманні коментарів:", error);
      message.error("❌ Сталася помилка при отриманні коментарів.");
    }
  };

  const handleAddComment = async (ideaId) => {
    if (!newComment.trim()) {
      return message.error("❌ Коментар не може бути порожнім.");
    }
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_FEEDBACK}/add`,
        { idea_id: ideaId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Коментар успішно додано.");
      setNewComment("");
      fetchComments(ideaId);
    } catch (error) {
      console.error("❌ Помилка додавання коментаря:", error);
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleStatusChange = async (ideaId, newStatus) => {
    try {
      setUpdatingStatus(ideaId);
      const token = getAuthToken();
      await axios.patch(
        API_UPDATE_STATUS,
        { idea_id: ideaId, new_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("✅ Статус оновлено.");
      fetchSelectedIdeas();
    } catch (error) {
      console.error("❌ Сталася помилка при оновленні статусу:", error.response || error);
      const errMsg =
        error?.response?.data?.message || "❌ Помилка при оновленні статусу.";
      message.error(errMsg);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSelectIdea = (ideaId) => {
    setSelectedIdeaId(ideaId);
    fetchComments(ideaId);
  };

  const handleShowDetails = () => {
    setShowDetails((prev) => !prev);
    if (!loadingSelectedIdeas && selectedIdeas.length === 0) {
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
              ) : selectedIdeas.length > 0 ? (
                selectedIdeas.map((idea) => (
                  <Card key={idea.id} style={{ marginTop: "10px" }}>
                    <p><strong>Назва:</strong> {idea.title}</p>
                    <p><strong>Опис:</strong> {idea.description}</p>
                    <p><strong>Статус:</strong> {idea.status}</p>
                    <Select
                      value={idea.status}
                      style={{ width: 160 }}
                      onChange={(value) => handleStatusChange(idea.id, value)}
                      loading={updatingStatus === idea.id}
                    >
                      <Option value="new">new</Option>
                      <Option value="approved">approved</Option>
                      <Option value="rejected">rejected</Option>
                      <Option value="archived">archived</Option>
                    </Select>
                    <p><strong>Автор:</strong> {
                      idea.sender_first_name || idea.sender_last_name
                        ? [idea.sender_first_name, idea.sender_last_name].filter(Boolean).join(" ")
                        : "Невідомо"
                    }</p>
                    <p><strong>Email автора:</strong> {idea.sender_email || "Невідомо"}</p>
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

export default AmbassadorPage;
