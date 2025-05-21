import React, { useEffect, useState, useCallback } from "react";
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
      const response = await fetch(API_PROFILE, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "❌ Сталася помилка при отриманні амбасадора.");
      }
      const data = await response.json();
      if (data?.id) {
        setAmbassador(data);
      } else {
        throw new Error("❌ Амбасадора не знайдено або відсутній ID.");
      }
    } catch (err) {
      message.error(err.message);
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
      const response = await fetch(`${AMBASSADOR_API}/${ambassador.user_id}/ideas`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Не вдалося отримати ідеї");
      const data = await response.json();
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
      const response = await fetch(`${API_FEEDBACK}/list?idea_id=${ideaId}`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Не вдалося завантажити коментарі");
      const data = await response.json();
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
      const response = await fetch(`${API_FEEDBACK}/add`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea_id: ideaId, text: newComment }),
      });
      if (!response.ok) throw new Error("Не вдалося додати коментар");
      message.success("✅ Коментар успішно додано.");
      setNewComment("");
      fetchComments(ideaId);
    } catch (error) {
      console.error("❌ Помилка додавання коментаря:", error);
      message.error("❌ Сталася помилка при додаванні коментаря.");
    }
  };

  const handleStatusChange = async (ideaId, newStatus) => {
    const currentIdea = selectedIdeas.find((idea) => idea.id === ideaId);
    if (!currentIdea || currentIdea.status === newStatus) return;

    try {
      setUpdatingStatus(ideaId);
      const token = getAuthToken();
      const response = await fetch(API_UPDATE_STATUS, {
        method: "PATCH",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idea_id: ideaId,
          new_status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Помилка при оновленні статусу");
      }

      message.success("✅ Статус оновлено.");
      fetchSelectedIdeas();
    } catch (error) {
      console.error("❌ Сталася помилка при оновленні статусу:", error);
      if (error.message.includes("fetch") || error.message.includes("Network")) {
        message.error("❌ Мережева помилка. Спробуйте пізніше.");
      } else {
        message.error(`❌ ${error.message}`);
      }
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
                      <Option value="pending">pending</Option>
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
