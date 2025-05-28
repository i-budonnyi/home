import React, { useEffect, useState, useCallback } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button,
  Tag, Input, Divider, message, Modal
} from "antd";
import {
  HeartOutlined, HeartFilled,
  UserAddOutlined, SendOutlined,
  ShareAltOutlined, CopyOutlined
} from "@ant-design/icons";
import axios from "axios";
import io from "socket.io-client";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const SOCKET_URL = "https://backend-avtologistika.onrender.com";
const API_BLOG_URL = `${API_BASE}/blogRoutes`;
const API_PROBLEMS_URL = `${API_BASE}/problems`;
const API_LIKE_URL = `${API_BASE}/likeRoutes`;
const API_COMMENT_URL = `${API_BASE}/commentRoutes`;
const API_SUBSCRIBE_URL = `${API_BASE}/subscriptionRoutes`;

const STATUS_TRANSLATION = {
  "до_секретаря": "Амбасадор рекомендує секретарю",
  "нове": "Нове",
  "очікує": "Очікує",
  "відхилено": "Відхилено",
  "відхилено_з_переглядом": "Відхилено з переглядом",
  "відхилено_на_доопрацювання": "Відхилено на доопрацювання"
};

const getTagColor = (type) => {
  switch (type) {
    case "blog": return "blue";
    case "idea": return "green";
    case "problem": return "red";
    default: return "default";
  }
};

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [filteredType, setFilteredType] = useState("all");
  const [shareModal, setShareModal] = useState({ visible: false, url: "" });
  const [selectedEntry, setSelectedEntry] = useState(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchLikes = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`);
      setLikesData(prev => ({
        ...prev,
        [entry.id]: {
          likesCount: res.data.likesCount || 0,
          userLiked: res.data.likedBy?.some(u => u.user_id === res.data.currentUserId),
        }
      }));
    } catch (err) {
      console.error("❌ Лайки:", err.message);
    }
  }, []);

  const fetchComments = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentsData(prev => ({
        ...prev,
        [entry.id]: res.data.comments || []
      }));
    } catch (err) {
      console.error("❌ Коментарі:", err.message);
    }
  }, []);

  const fetchAllEntries = useCallback(async () => {
    try {
      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`, { headers }),
        axios.get(`${API_PROBLEMS_URL}`, { headers })
      ]);

      const blogs = blogsRes.data?.blogs?.map(b => ({
        ...b, entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim() || b.author_email || "Невідомий"
      })) || [];

      const ideas = blogsRes.data?.ideas?.map(i => ({
        ...i, entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim() || i.author_email || "Невідомий"
      })) || [];

      const problems = problemsRes.data?.map(p => ({
        ...p, entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim() || p.author_email || "Невідомий"
      })) || [];

      const all = [...blogs, ...ideas, ...problems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setEntries(all);
      all.forEach(entry => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("❌ Дані:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes, fetchComments]);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API_SUBSCRIBE_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const map = res.data.subscriptions.reduce((acc, sub) => {
        acc[sub.blog_id || sub.idea_id || sub.problem_id] = true;
        return acc;
      }, {});
      setSubscribedEntries(map);
    } catch (err) {
      console.error("❌ Підписки:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchAllEntries();
    fetchSubscriptions();
  }, [fetchAllEntries, fetchSubscriptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("entryType");
    const id = params.get("id");
    if (type && id) {
      setFilteredType(type);
      setTimeout(() => {
        const el = document.getElementById(`entry-${type}-${id}`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [entries]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("🟢 WebSocket connected:", socket.id);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        socket.emit("register", payload.user_id || payload.id);
      } catch {
        console.warn("❗ Неможливо витягти user_id з токена");
      }
    });

    socket.on("entry_created", (entry) => {
      console.log("📥 Нова ідея/блог:", entry);
      const entryWithDefaults = {
        ...entry,
        entryType: entry.type,
        authorname: entry.author_name || "Невідомий",
      };
      setEntries(prev => [entryWithDefaults, ...prev]);
      fetchLikes(entryWithDefaults);
      fetchComments(entryWithDefaults);
    });

    socket.on("new_comment", (data) => {
      console.log("💬 Новий коментар:", data);
      fetchComments({ id: data.entry_id, entryType: data.entry_type });
    });

    socket.on("notification", (data) => {
      console.log("🔔 Сповіщення:", data.message);
    });

    return () => socket.disconnect();
  }, [fetchLikes, fetchComments]);

  const toggleLike = async (entry) => {
    try {
      const token = getAuthToken();
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchLikes(entry);
    } catch {
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleSubscribe = async (entry) => {
    try {
      const token = getAuthToken();
      const isSub = subscribedEntries[entry.id];
      const method = isSub ? "delete" : "post";
      const url = `${API_SUBSCRIBE_URL}/${isSub ? "unsubscribe" : "subscribe"}`;
      await axios({ method, url, data: { entry_id: entry.id, entry_type: entry.entryType }, headers: { Authorization: `Bearer ${token}` } });
      setSubscribedEntries(prev => ({ ...prev, [entry.id]: !isSub }));
      message.success(isSub ? "Відписано" : "Підписано");
    } catch {
      message.error("Не вдалося змінити підписку.");
    }
  };

  const handleCommentSubmit = async (entry) => {
    const comment = newComment[entry.id]?.trim();
    if (!comment) return;
    try {
      const token = getAuthToken();
      await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        comment
      }, { headers: { Authorization: `Bearer ${token}` } });
      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch {
      message.error("Не вдалося додати коментар.");
    }
  };

  const translateStatus = (status) =>
    STATUS_TRANSLATION[status] || decodeURIComponent(status || "").replace(/_/g, " ");

  const filteredEntries = filteredType === "all"
    ? entries
    : entries.filter(e => e.entryType === filteredType);

  const handleShare = (entry) => {
    const url = `${window.location.origin}/blog?entryType=${entry.entryType}&id=${entry.id}`;
    setShareModal({ visible: true, url });
    navigator.clipboard.writeText(url).then(() => {
      message.success("Посилання скопійовано в буфер");
    });
  };

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "80px auto 0" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 20 }}>
        <Button href="/worker">← Назад</Button>
      </div>

      {isLoading ? <Skeleton active /> : (
        <>
          <Space style={{ marginBottom: 20 }}>
            {["all", "blog", "idea", "problem"].map((type) => (
              <Button
                key={type}
                type={filteredType === type ? "primary" : "default"}
                onClick={() => setFilteredType(type)}
              >
                {type === "all" ? "Усі" : type}
              </Button>
            ))}
          </Space>

          <Space direction="vertical" style={{ width: "100%" }}>
            {filteredEntries.map(entry => (
              <Card key={entry.id} id={`entry-${entry.entryType}-${entry.id}`}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Title level={4} style={{ cursor: "pointer" }} onClick={() => setSelectedEntry(entry)}>
                    {entry.title}
                  </Title>
                  <Button icon={<UserAddOutlined />} onClick={() => handleSubscribe(entry)}>
                    {subscribedEntries[entry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                </div>

                <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                <Text strong>Автор: {entry.authorname}</Text>
                {entry.status && (
                  <p style={{ marginTop: 8 }}><b>Статус:</b> {translateStatus(entry.status)}</p>
                )}

                <Divider />
                <Text>{entry.description || "Без опису"}</Text>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <Space>
                    <Button type="text" onClick={() => toggleLike(entry)}>
                      {likesData[entry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                    </Button>
                    <Text>{likesData[entry.id]?.likesCount || 0}</Text>
                  </Space>
                  <Button icon={<ShareAltOutlined />} onClick={() => handleShare(entry)}>Поділитися</Button>
                </div>

                <Divider />
                <Title level={5}>Коментарі:</Title>
                {(commentsData[entry.id] || []).map(comment => (
                  <Card key={comment.id} size="small" style={{ marginBottom: 8 }}>
                    <Text strong>{`${comment.author_first_name || ""} ${comment.author_last_name || ""}`}</Text>
                    <p>{comment.text}</p>
                  </Card>
                ))}
                <TextArea
                  value={newComment[entry.id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [entry.id]: e.target.value })}
                  placeholder="Ваш коментар..."
                />
                <Button icon={<SendOutlined />} type="primary" style={{ marginTop: 8 }} onClick={() => handleCommentSubmit(entry)}>
                  Надіслати
                </Button>
              </Card>
            ))}
          </Space>
        </>
      )}

      <Modal title="Поділитися постом" open={shareModal.visible} onCancel={() => setShareModal({ visible: false, url: "" })} footer={null}>
        <p><b>Посилання:</b> {shareModal.url}</p>
        <Space wrap style={{ marginTop: 10 }}>
          <Button icon={<CopyOutlined />} onClick={() => {
            navigator.clipboard.writeText(shareModal.url);
            message.success("Скопійовано!");
          }}>
            Копіювати
          </Button>
          <Button href={`https://t.me/share/url?url=${encodeURIComponent(shareModal.url)}`} target="_blank">Telegram</Button>
          <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModal.url)}`} target="_blank">Facebook</Button>
          <Button href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareModal.url)}`} target="_blank">Twitter</Button>
        </Space>
      </Modal>

      <Modal title={selectedEntry?.title} open={!!selectedEntry} onCancel={() => setSelectedEntry(null)} footer={null}>
        <Tag color={getTagColor(selectedEntry?.entryType)}>{selectedEntry?.entryType?.toUpperCase()}</Tag>
        <p><b>Автор:</b> {selectedEntry?.authorname}</p>
        {selectedEntry?.status && <p><b>Статус:</b> {translateStatus(selectedEntry.status)}</p>}
        <Divider />
        <p>{selectedEntry?.description || "Без опису"}</p>
      </Modal>
    </Content>
  );
};

export default BlogPage;
