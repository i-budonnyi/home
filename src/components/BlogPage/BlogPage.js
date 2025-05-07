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
const API_USER_URL = `${API_BASE}/users/profile`;

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [filteredType, setFilteredType] = useState("all");

  const getAuthToken = () => localStorage.getItem("token");

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      await axios.get(API_USER_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn("⚠️ Не вдалося підтягнути користувача:", err.message);
    }
  }, []);

  const fetchLikes = useCallback(async (entry) => {
    try {
      const response = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`);
      setLikesData((prev) => ({
        ...prev,
        [entry.id]: {
          likesCount: response.data.likesCount || 0,
          userLiked: response.data.likedBy?.some((u) => u.user_id === response.data.currentUserId),
        },
      }));
    } catch (err) {
      console.error("❌ Лайки:", err.message);
    }
  }, []);

  const fetchComments = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: response.data.comments || [],
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
        axios.get(`${API_PROBLEMS_URL}`, { headers }),
      ]);

      const blogs = blogsRes.data?.blogs?.map((b) => ({
        ...b,
        entryType: "blog",
        authorname: getFormattedAuthor(b),
      })) || [];

      const ideas = blogsRes.data?.ideas?.map((i) => ({
        ...i,
        entryType: "idea",
        authorname: getFormattedAuthor(i),
      })) || [];

      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: getFormattedAuthor(p),
      })) || [];

      const allEntries = [...blogs, ...ideas, ...problems].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setEntries(allEntries);
      allEntries.forEach((entry) => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("❌ Дані:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes, fetchComments]);

  const getFormattedAuthor = (data) => {
    const rawName = `${data.author_first_name || ""} ${data.author_last_name || ""}`.trim();
    if (rawName) return rawName + ".";
    if (data.author_email) return data.author_email + ".";
    if (data.author) return data.author + ".";
    return "Невідомий.";
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_SUBSCRIBE_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subscriptions = response.data.subscriptions.reduce((acc, sub) => {
        acc[sub.blog_id || sub.idea_id || sub.problem_id] = true;
        return acc;
      }, {});
      setSubscribedEntries(subscriptions);
    } catch (err) {
      console.error("❌ Підписки:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchAllEntries();
    fetchSubscriptions();
  }, [fetchCurrentUser, fetchAllEntries, fetchSubscriptions]);

  const toggleLike = async (entry) => {
    try {
      const token = getAuthToken();
      await axios.post(
        `${API_LIKE_URL}/toggle-like`,
        { entry_id: entry.id, entry_type: entry.entryType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLikes(entry);
    } catch (err) {
      console.error("❌ Лайк:", err.message);
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleSubscribe = async (entry) => {
    try {
      const token = getAuthToken();
      const isSubscribed = subscribedEntries[entry.id];
      const response = await axios({
        method: isSubscribed ? "delete" : "post",
        url: `${API_SUBSCRIBE_URL}/${isSubscribed ? "unsubscribe" : "subscribe"}`,
        data: { entry_id: entry.id, entry_type: entry.entryType },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribedEntries((prev) => ({ ...prev, [entry.id]: !isSubscribed }));
      message.success(response.data.message);
    } catch (err) {
      console.error("❌ Підписка:", err.message);
      message.error("Не вдалося виконати операцію.");
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
        comment: comment,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("❌ Коментар — помилка:", err.response?.data || err.message);
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

  const filteredEntries = filteredType === "all"
    ? entries
    : entries.filter((e) => e.entryType === filteredType);

  return (
    <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <>
          <Space style={{ marginBottom: "20px", justifyContent: "center", display: "flex" }}>
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

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredEntries.map((entry) => (
              <Card key={entry.id} hoverable style={{ borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        const name = getFormattedAuthor(comment);
                        return (
                          <Card key={comment.id} size="small" style={{ backgroundColor: "#fafafa", border: "1px solid #eee", borderRadius: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <Text strong>{name}</Text>
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                {!comment.createdAt || isNaN(Date.parse(comment.createdAt))
                                  ? "Невідома дата"
                                  : new Date(comment.createdAt).toLocaleString("uk-UA")}
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
                      style={{ marginTop: "8px", marginBottom: "8px" }}
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
