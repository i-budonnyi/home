/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button, Tag, Input, Divider, message
} from "antd";
import {
  HeartOutlined, HeartFilled, SendOutlined, UserAddOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE             = "https://backend-avtologistika.onrender.com/api";
const API_BLOG_URL         = `${API_BASE}/blogRoutes`;
const API_PROBLEMS_URL     = `${API_BASE}/problems`;
const API_LIKE_URL         = `${API_BASE}/likeRoutes`;
const API_COMMENT_URL      = `${API_BASE}/commentRoutes`;
const API_SUBSCRIPTION_URL = `${API_BASE}/subscriptionRoutes`;

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [userId, setUserId] = useState(null);
  const [filteredType, setFilteredType] = useState("all");

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (err) {
      console.error("❌ Помилка отримання userId:", err);
    }
  };

  const fetchAllEntries = async () => {
    try {
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const [blogRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`, { headers }),
        axios.get(API_PROBLEMS_URL, { headers })
      ]);

      const blogs = (blogRes.data.blogs || []).map(b => ({
        ...b, entryType: "blog", authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim()
      }));

      const ideas = (blogRes.data.ideas || []).map(i => ({
        ...i, entryType: "idea", authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim()
      }));

      const problems = (problemsRes.data || []).map(p => ({
        ...p, entryType: "problem", authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim()
      }));

      const allEntries = [...blogs, ...ideas, ...problems];
      setEntries(allEntries);
      allEntries.forEach(e => {
        fetchLikes(e);
        fetchComments(e);
      });
    } catch (err) {
      console.error("❌ Помилка завантаження записів:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLikes = async (entry) => {
    try {
      const res = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setLikesData(prev => ({
        ...prev,
        [entry.id]: {
          likesCount: res.data.likesCount || 0,
          userLiked: res.data.likedBy?.some(u => u.user_id === userId)
        }
      }));
    } catch (err) {
      console.error("❌ Лайки не завантажено:", err);
    }
  };

  const toggleLike = async (entry) => {
    try {
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchLikes(entry);
    } catch (err) {
      console.error("❌ Лайк не вдалось змінити:", err);
      message.error("Помилка при лайкуванні.");
    }
  };

  const fetchComments = async (entry) => {
    try {
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCommentsData(prev => ({ ...prev, [entry.id]: res.data.comments || [] }));
    } catch (err) {
      console.error("❌ Коментарі не завантажено:", err);
    }
  };

  const handleCommentSubmit = async (entry) => {
    const text = newComment[entry.id]?.trim();
    if (!text) return;
    try {
      await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        comment: text
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("❌ Помилка додавання коментаря:", err);
      message.error("Не вдалося додати коментар.");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(`${API_SUBSCRIPTION_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const map = {};
      res.data.forEach(s => { map[s.entry_id] = true; });
      setSubscribedEntries(map);
    } catch (err) {
      console.error("❌ Підписки не завантажено:", err);
    }
  };

  const toggleSubscription = async (entry) => {
    const isSub = subscribedEntries[entry.id];
    try {
      await axios({
        method: isSub ? "delete" : "post",
        url: `${API_SUBSCRIPTION_URL}/${isSub ? "unsubscribe" : "subscribe"}`,
        data: { entry_id: entry.id, entry_type: entry.entryType },
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setSubscribedEntries(prev => ({ ...prev, [entry.id]: !isSub }));
      message.success(isSub ? "Відписано" : "Підписано");
    } catch (err) {
      console.error("❌ Помилка підписки:", err);
      message.error("Не вдалося змінити підписку.");
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

  useEffect(() => {
    fetchUserId();
    fetchAllEntries();
    fetchSubscriptions();
  }, []);

  const filteredEntries =
    filteredType === "all" ? entries : entries.filter(e => e.entryType === filteredType);

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={5}>Фільтрувати за типом:</Title>
            <Space>
              {["all", "blog", "idea", "problem"].map(t => (
                <Button key={t} type={filteredType === t ? "primary" : "default"} onClick={() => setFilteredType(t)}>
                  {t === "all" ? "Усі" : t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </Space>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {filteredEntries.map(entry => (
              <Card key={entry.id} hoverable>
                <Title level={4}>{entry.title}</Title>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                <Text type="secondary">
                  Опубліковано: {new Date(entry.createdAt).toLocaleDateString("uk-UA")}
                </Text>
                <Divider />
                <Text>{entry.description || "Без опису"}</Text>
                <Divider />
                <Space>
                  <Button type="text" onClick={() => toggleLike(entry)}>
                    {likesData[entry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                  </Button>
                  <Text>{likesData[entry.id]?.likesCount || 0} лайків</Text>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => toggleSubscription(entry)}
                  >
                    {subscribedEntries[entry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                </Space>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {(commentsData[entry.id] || []).map(comment => (
                    <Card key={comment.id} size="small" style={{ backgroundColor: "#fafafa" }}>
                      <Text strong>{comment.author_first_name || "Анонім"} {comment.author_last_name || ""}</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(comment.createdAt).toLocaleString("uk-UA")}
                      </Text><br />
                      <Text>{comment.comment || comment.text}</Text>
                    </Card>
                  ))}
                  <TextArea
                    rows={2}
                    value={newComment[entry.id] || ""}
                    onChange={e => setNewComment(prev => ({ ...prev, [entry.id]: e.target.value }))}
                    placeholder="Напишіть коментар..."
                  />
                  <Button type="primary" icon={<SendOutlined />} onClick={() => handleCommentSubmit(entry)}>
                    Відправити
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
