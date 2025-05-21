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
  Divider,
} from "antd";
import { CommentOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const AMBASSADOR_API = `${API_BASE}/ambassadorRoutes`;
const API_PROFILE = `${AMBASSADOR_API}/profile`;
const API_FEEDBACK = `${API_BASE}/feedbackRoutes`;
const API_UPDATE_STATUS = `${AMBASSADOR_API}/update-status`;

const STATUS_OPTIONS = [
  { value: "нове", label: "🆕 Нове" },
  { value: "очікує", label: "⏳ Очікує" },
  { value: "до_секретаря", label: "📩 До секретаря" },
  { value: "відхилено", label: "❌ Відхилено" },
  { value: "відхилено_з_переглядом", label: "🔁 Відхилено з переглядом" },
  { value: "відхилено_на_доопрацювання", label: "🛠️ На доопрацювання" },
];

const AmbassadorPage = () => {
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState([]);
  const [comments, setComments] = useState({});
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [statusLoading, setStatusLoading] = useState(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  const token = localStorage.getItem("token");

  const translateStatus = (value) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.label || value;

  const fetchAmbassador = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAmbassador(data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchIdeas = useCallback(async () => {
    if (!ambassador?.user_id) return;
    setLoadingIdeas(true);
    try {
      const res = await fetch(`${AMBASSADOR_API}/${ambassador.user_id}/ideas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIdeas(data);
    } catch (err) {
      message.error("Помилка при завантаженні ідей");
    } finally {
      setLoadingIdeas(false);
    }
  }, [ambassador?.user_id, token]);

  const fetchComments = async (ideaId) => {
    try {
      const res = await fetch(`${API_FEEDBACK}/list?idea_id=${ideaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setComments((prev) => ({ ...prev, [ideaId]: data }));
    } catch (err) {
      message.error("Не вдалося завантажити коментарі");
    }
  };

  const updateStatus = async (ideaId, newStatus) => {
    if (!newStatus) return;
    setStatusLoading(ideaId);
    try {
      const res = await fetch(API_UPDATE_STATUS, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea_id: ideaId, new_status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      message.success("Статус оновлено");
      await fetchIdeas();
    } catch (err) {
      message.error("Не вдалося оновити статус");
    } finally {
      setStatusLoading(null);
    }
  };

  const submitComment = async (ideaId) => {
    if (!newComment.trim()) return message.warning("Введіть коментар");
    try {
      const res = await fetch(`${API_FEEDBACK}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idea_id: ideaId, text: newComment }),
      });
      if (!res.ok) throw new Error("Коментар не додано");
      message.success("Коментар додано");
      setNewComment("");
      fetchComments(ideaId);
    } catch (err) {
      message.error(err.message);
    }
  };

  useEffect(() => {
    fetchAmbassador();
  }, [fetchAmbassador]);

  useEffect(() => {
    if (ambassador?.user_id) fetchIdeas();
  }, [ambassador?.user_id, fetchIdeas]);

  if (loading) {
    return (
      <Layout style={{ padding: 48, textAlign: "center" }}>
        <Spin size="large" />
        <Title>Завантаження профілю...</Title>
      </Layout>
    );
  }

  if (!ambassador) {
    return (
      <Layout style={{ padding: 48 }}>
        <Title level={3} type="danger">❌ Профіль амбасадора не знайдено</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Card bordered hoverable style={{ marginBottom: 24 }}>
        <Title level={3}>
          👤 {ambassador.first_name} {ambassador.last_name}
        </Title>
        <Text>Email: {ambassador.email}</Text> <br />
        <Text>Телефон: {ambassador.phone}</Text> <br />
        <Text>Посада: {ambassador.position || "Не вказано"}</Text> <br />
        <Divider />
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchIdeas}
          loading={loadingIdeas}
        >
          Оновити список ідей
        </Button>
      </Card>

      {ideas.length === 0 ? (
        <Card>
          <Text>Немає ідей для цього амбасадора.</Text>
        </Card>
      ) : (
        ideas.map((idea) => (
          <Card
            key={idea.id}
            title={`Ідея: ${idea.title}`}
            style={{ marginBottom: 24 }}
          >
            <p><Text strong>Опис:</Text> {idea.description}</p>
            <p><Text strong>Автор:</Text> {idea.sender_first_name} {idea.sender_last_name}</p>
            <p><Text strong>Email:</Text> {idea.sender_email}</p>
            <p><Text strong>Статус:</Text> {translateStatus(idea.status)}</p>

            <Select
              value={idea.status}
              style={{ width: 280, marginBottom: 12 }}
              onChange={(value) => updateStatus(idea.id, value)}
              loading={statusLoading === idea.id}
            >
              {STATUS_OPTIONS.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>

            <Button
              type="dashed"
              icon={<CommentOutlined />}
              onClick={() => {
                setSelectedIdeaId(idea.id);
                fetchComments(idea.id);
              }}
              style={{ marginLeft: 8 }}
            >
              Коментарі
            </Button>

            {selectedIdeaId === idea.id && (
              <div style={{ marginTop: 20 }}>
                <List
                  header={<b>Коментарі</b>}
                  dataSource={comments[idea.id] || []}
                  renderItem={(item) => (
                    <List.Item>
                      <Card size="small" style={{ width: "100%" }}>
                        <Text strong>
                          {item.sender_first_name} {item.sender_last_name}
                        </Text>
                        <p>{item.text}</p>
                      </Card>
                    </List.Item>
                  )}
                />
                <Input.TextArea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  placeholder="Додати новий коментар..."
                  style={{ marginTop: 10 }}
                />
                <Button
                  type="primary"
                  onClick={() => submitComment(idea.id)}
                  style={{ marginTop: 10 }}
                >
                  Надіслати
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </Layout>
  );
};

export default AmbassadorPage;
