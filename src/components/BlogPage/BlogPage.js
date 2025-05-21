import React, { useEffect, useState, useCallback } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button,
  Tag, Input, Divider, message
} from "antd";
import {
  HeartOutlined, HeartFilled,
  UserAddOutlined, SendOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
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

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [filteredType, setFilteredType] = useState("all");

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

      const blogs = blogsRes.data?.blogs?.map((b) => ({
        ...b,
        entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim() || b.author_email || "Невідомий"
      })) || [];

      const ideas = blogsRes.data?.ideas?.map((i) => ({
        ...i,
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim() || i.author_email || "Невідомий"
      })) || [];

      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim() || p.author_email || "Невідомий"
      })) || [];

      const allEntries = [...blogs, ...ideas, ...problems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setEntries(allEntries);
      allEntries.forEach(entry => {
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

  const toggleLike = async (entry) => {
    try {
      const token = getAuthToken();
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLikes(entry);
    } catch (err) {
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleSubscribe = async (entry) => {
    try {
      const token = getAuthToken();
      const isSub = subscribedEntries[entry.id];
      const method = isSub ? "delete" : "post";
      const url = `${API_SUBSCRIBE_URL}/${isSub ? "unsubscribe" : "subscribe"}`;
      await axios({
        method,
        url,
        data: { entry_id: entry.id, entry_type: entry.entryType },
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribedEntries(prev => ({ ...prev, [entry.id]: !isSub }));
      message.success(isSub ? "Відписано" : "Підписано");
    } catch (err) {
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
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      message.error("Не вдалося додати коментар.");
    }
  };

  const getTagColor = (type) => {
    switch (type) {
      case "blog": return "blue";
      case "idea": return "green";
      case "problem": return "gold";
      default: return "default";
    }
  };

  const translateStatus = (status) =>
    STATUS_TRANSLATION[status] || decodeURIComponent(status || "").replace(/_/g, " ");

  const filteredEntries = filteredType === "all"
    ? entries
    : entries.filter(e => e.entryType === filteredType);

  return (
    <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Button type="default" href="/worker" style={{ backgroundColor: "#e6f7ff", borderColor: "#91d5ff" }}>
          💡 Повернутись на головну 
        </Button>
      </div>

      {isLoading ? <Skeleton active /> : (
        <>
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <Space>
              {["all", "blog", "idea", "problem"].map((type) => (
                <Button
                  key={type}
                  type={filteredType === type ? "primary" : "default"}
                  onClick={() => setFilteredType(type)}
                >
                  {type === "all" ? "Усі" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </Space>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredEntries.map(entry => (
              <Card key={entry.id} hoverable style={{ borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Title level={4} style={{ margin: 0 }}>{entry.title}</Title>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => handleSubscribe(entry)}
                  >
                    {subscribedEntries[entry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                  <Text strong>Автор: {entry.authorname}</Text>
                </div>

                {entry.status && (
                  <p style={{ marginTop: 8 }}>
                    <b>Статус:</b> {translateStatus(entry.status)}
                  </p>
                )}

                <Divider style={{ margin: "8px 0" }} />
                <Text>{entry.description || "Без опису"}</Text>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <Space>
                    <Button type="text" onClick={() => toggleLike(entry)}>
                      {likesData[entry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                    </Button>
                    <Text>{likesData[entry.id]?.likesCount || 0} лайк(ів)</Text>
                  </Space>
                </div>

                <Divider />
                <div>
                  <Title level={5}>Коментарі:</Title>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {commentsData[entry.id]?.length ? (
                      commentsData[entry.id].map((comment) => {
                        const fullName = `${comment.author_first_name || ""} ${comment.author_last_name || ""}`.trim();
                        const displayName = fullName ? `${fullName}.` : (comment.author_email || "Невідомий.");
                        return (
                          <Card key={comment.id} size="small" style={{ backgroundColor: "#fafafa", border: "1px solid #eee", borderRadius: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text strong>{displayName}</Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleString("uk-UA") : "Невідома дата"}
                              </Text>
                            </div>
                            <Text>{comment.text}</Text>
                          </Card>
                        );
                      })
                    ) : (
                      <Text type="secondary">Коментарів ще немає.</Text>
                    )}
                  </Space>

                  <div style={{ marginTop: "12px" }}>
                    <Text strong>Додати коментар:</Text>
                    <TextArea
                      rows={2}
                      value={newComment[entry.id] || ""}
                      onChange={(e) => setNewComment({ ...newComment, [entry.id]: e.target.value })}
                      placeholder="Напишіть коментар..."
                      style={{ marginTop: 8, marginBottom: 8 }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => handleCommentSubmit(entry)}
                    >
                      Відправити
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
