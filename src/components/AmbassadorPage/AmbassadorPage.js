import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Card,
  Typography,
  message,
  Spin,
  Button,
  List,
  Input,
} from "antd";

const { Title } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const AMBASSADOR_API = `${API_BASE}/ambassadorRoutes`;
const API_PROFILE = `${AMBASSADOR_API}/profile`;
const API_FEEDBACK = `${API_BASE}/feedbackRoutes`;
const API_UPDATE_STATUS = `${AMBASSADOR_API}/update-status`;

const STATUS_TRANSLATION = {
  "до_секретаря": "Амбасадор рекомендує секретарю",
  "нове": "Нове",
  "очікує": "Очікує",
  "відхилено": "Відхилено",
  "відхилено_з_переглядом": "Відхилено з переглядом",
  "відхилено_на_доопрацювання": "Відхилено на доопрацювання",
};

const AmbassadorPage = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchAmbassador = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не вдалося завантажити амбасадора");
      const data = await res.json();
      setAmbassador(data);
    } catch (err) {
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchIdeas = useCallback(async () => {
    if (!ambassador?.user_id) return;
    try {
      setLoadingIdeas(true);
      const token = getToken();
      const res = await fetch(`${AMBASSADOR_API}/${ambassador.user_id}/ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не вдалося завантажити ідеї");
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoadingIdeas(false);
    }
  }, [ambassador]);

  const fetchComments = async (ideaId) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_FEEDBACK}/list?idea_id=${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не вдалося завантажити коментарі");
      const data = await res.json();
      setComments((prev) => ({ ...prev, [ideaId]: data }));
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleStatusChange = async (ideaId) => {
    console.log("🔄 Зміна статусу — ID ідеї:", ideaId);
    try {
      setUpdatingStatus(ideaId);
      const token = getToken();
      const body = {
        idea_id: ideaId,
        new_status: "до_секретаря", // ← ТУТ тимчасовий статус
      };
      console.log("📤 Запит на API:", API_UPDATE_STATUS);
      console.log("📦 Тіло запиту:", body);

      const res = await fetch(API_UPDATE_STATUS, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("📡 HTTP status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Текст помилки:", errorText);
        throw new Error(`HTTP ${res.status} — ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Успішна відповідь:", data);

      message.success("✅ Статус оновлено");

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId ? { ...idea, status: "нове" } : idea
        )
      );
    } catch (err) {
      console.error("🚨 Помилка при оновленні статусу:", err);
      message.error("❌ Помилка оновлення статусу: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleAddComment = async (ideaId) => {
    if (!newComment.trim()) return message.warning("Введіть коментар");
    try {
      const token = getToken();
      const res = await fetch(`${API_FEEDBACK}/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea_id: ideaId, text: newComment }),
      });
      if (!res.ok) throw new Error("Не вдалося додати коментар");
      message.success("Коментар додано");
      setNewComment("");
      fetchComments(ideaId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const translateStatus = (status) =>
    STATUS_TRANSLATION[status] || decodeURIComponent(status || "").replace(/_/g, " ");

  useEffect(() => {
    fetchAmbassador();
  }, [fetchAmbassador]);

  useEffect(() => {
    if (ambassador) fetchIdeas();
  }, [ambassador, fetchIdeas]);

  if (loading) {
    return (
      <Layout style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <Title>Завантаження...</Title>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: 40, textAlign: "center" }}>
        <Title style={{ color: "red" }}>{error}</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <Card style={{ marginBottom: 20 }}>
        <Title level={4}>👤 {ambassador.first_name} {ambassador.last_name}</Title>
        <p><b>Email:</b> {ambassador.email}</p>
        <p><b>Телефон:</b> {ambassador.phone}</p>
        <p><b>Посада:</b> {ambassador.position || "Не вказано"}</p>
        <Button onClick={fetchIdeas} type="default">🔄 Оновити список ідей</Button>
      </Card>

      {loadingIdeas ? (
        <Spin />
      ) : ideas.length === 0 ? (
        <Title level={5}>Немає ідей для цього амбасадора</Title>
      ) : (
        ideas.map((idea) => (
          <Card key={idea.id} title={`Ідея: ${idea.title}`} style={{ marginBottom: 20 }}>
            <p><b>Опис:</b> {idea.description}</p>
            <p><b>Автор:</b> {[idea.sender_first_name, idea.sender_last_name].filter(Boolean).join(" ")}</p>
            <p><b>Email:</b> {idea.sender_email}</p>
            <p><b>Статус:</b> {translateStatus(idea.status)}</p>

            <Button
              type="primary"
              onClick={() => handleStatusChange(idea.id)}
              loading={updatingStatus === idea.id}
              disabled={idea.status === "нове"}
              style={{ marginBottom: 12 }}
            >
              Встановити статус "до_секретаря"
            </Button>

            <Button onClick={() => {
              setSelectedIdeaId(idea.id);
              fetchComments(idea.id);
            }}>
              💬 Коментарі
            </Button>

            {selectedIdeaId === idea.id && (
              <>
                <List
                  dataSource={comments[idea.id] || []}
                  renderItem={(item) => (
                    <List.Item>
                      <Card style={{ width: "90%" }}>
                        <b>{item.sender_first_name} {item.sender_last_name}</b>
                        <p>{item.text}</p>
                      </Card>
                    </List.Item>
                  )}
                />
                <Input.TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Додайте коментар..."
                  style={{ marginTop: 12 }}
                />
                <Button
                  type="primary"
                  style={{ marginTop: 12 }}
                  onClick={() => handleAddComment(idea.id)}
                >
                  Додати коментар
                </Button>
              </>
            )}
          </Card>
        ))
      )}
    </Layout>
  );
};

export default AmbassadorPage;
