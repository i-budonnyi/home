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
    } catch {}
  }, []);

  const fetchComments = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentsData(prev => ({ ...prev, [entry.id]: res.data.comments || [] }));
    } catch {}
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
    } catch {
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
    } catch {}
  }, []);

  useEffect(() => {
    fetchAllEntries();
    fetchSubscriptions();
  }, [fetchAllEntries, fetchSubscriptions]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        socket.emit("register", payload.user_id || payload.id);
      } catch {}
    });

    socket.on("entry_created", (entry) => {
      const fullEntry = {
        ...entry,
        entryType: entry.type,
        authorname: entry.author_name || "Невідомий"
      };
      setEntries(prev => [fullEntry, ...prev]);
      fetchLikes(fullEntry);
      fetchComments(fullEntry);
    });

    socket.on("new_comment", (data) => {
      fetchComments({ id: data.entry_id, entryType: data.entry_type });
    });

    return () => socket.disconnect();
  }, [fetchLikes, fetchComments]);

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

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "80px auto 0" }}>
      <Button onClick={() => setFilteredType("all")}>Показати всі</Button>
      <Space style={{ marginBottom: 20, marginLeft: 20 }}>
        {['blog', 'idea', 'problem'].map(type => (
          <Button
            key={type}
            type={filteredType === type ? "primary" : "default"}
            onClick={() => setFilteredType(type)}
          >
            {type.toUpperCase()}
          </Button>
        ))}
      </Space>
      {isLoading ? <Skeleton active /> : (
        <Space direction="vertical" style={{ width: "100%" }}>
          {entries
            .filter(e => filteredType === "all" || e.entryType === filteredType)
            .map(entry => (
              <Card key={entry.id}>
                <Title level={4}>{entry.title}</Title>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType}</Tag>
                <Text>{entry.description}</Text>
                <Divider />
                <TextArea
                  value={newComment[entry.id] || ""}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [entry.id]: e.target.value }))}
                />
                <Button icon={<SendOutlined />} type="primary" onClick={() => handleCommentSubmit(entry)}>
                  Надіслати
                </Button>
                <Divider />
                {(commentsData[entry.id] || []).map((c, i) => (
                  <p key={i}><Text strong>{c.author_first_name || "Анонім"}</Text>: {c.text}</p>
                ))}
              </Card>
            ))}
        </Space>
      )}
    </Content>
  );
};

export default BlogPage;