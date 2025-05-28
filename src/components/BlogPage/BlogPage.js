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
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [shareModal, setShareModal] = useState({ visible: false, url: "" });

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

  const handleShare = (entry) => {
    const url = `${window.location.origin}/blog?entryType=${entry.entryType}&id=${entry.id}`;
    setShareModal({ visible: true, url });
    navigator.clipboard.writeText(url).then(() => {
      message.success("Посилання скопійовано в буфер");
    });
  };

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "80px auto 0" }}>
      <Button onClick={() => setFilteredType("all")}>Показати всі</Button>
      <Space style={{ marginBottom: 20, marginLeft: 20 }}>
        {["blog", "idea", "problem"].map((type) => (
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
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Title level={4} onClick={() => setSelectedEntry(entry)} style={{ cursor: "pointer" }}>
                    {entry.title}
                  </Title>
                  <Button icon={<UserAddOutlined />} onClick={() => handleSubscribe(entry)}>
                    {subscribedEntries[entry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                </div>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType}</Tag>
                <Text>{entry.description}</Text>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                  <Space>
                    <Button type="text" onClick={() => toggleLike(entry)}>
                      {likesData[entry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                    </Button>
                    <Text>{likesData[entry.id]?.likesCount || 0}</Text>
                  </Space>
                  <Button icon={<ShareAltOutlined />} onClick={() => handleShare(entry)}>
                    Поділитися
                  </Button>
                </div>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                {(commentsData[entry.id] || []).map((comment, i) => (
                  <p key={i}><Text strong>{comment.author_first_name || "Анонім"}:</Text> {comment.text}</p>
                ))}
                <TextArea
                  value={newComment[entry.id] || ""}
                  onChange={(e) => setNewComment(prev => ({ ...prev, [entry.id]: e.target.value }))}
                  placeholder="Ваш коментар..."
                />
                <Button
                  icon={<SendOutlined />}
                  type="primary"
                  style={{ marginTop: 8 }}
                  onClick={() => handleCommentSubmit(entry)}
                >
                  Надіслати
                </Button>
              </Card>
            ))}
        </Space>
      )}

      <Modal
        title="Поділитися записом"
        open={shareModal.visible}
        onCancel={() => setShareModal({ visible: false, url: "" })}
        footer={null}
      >
        <p><b>Посилання:</b> {shareModal.url}</p>
        <Space wrap style={{ marginTop: 10 }}>
          <Button icon={<CopyOutlined />} onClick={() => {
            navigator.clipboard.writeText(shareModal.url);
            message.success("Скопійовано!");
          }}>
            Копіювати
          </Button>
          <Button href={`https://t.me/share/url?url=${encodeURIComponent(shareModal.url)}`} target="_blank">
            Telegram
          </Button>
          <Button href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModal.url)}`} target="_blank">
            Facebook
          </Button>
          <Button href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareModal.url)}`} target="_blank">
            Twitter
          </Button>
        </Space>
      </Modal>

      <Modal
        title={selectedEntry?.title}
        open={!!selectedEntry}
        onCancel={() => setSelectedEntry(null)}
        footer={null}
      >
        <Tag color={getTagColor(selectedEntry?.entryType)}>{selectedEntry?.entryType}</Tag>
        <p><b>Автор:</b> {selectedEntry?.authorname}</p>
        <Divider />
        <p>{selectedEntry?.description}</p>
      </Modal>
    </Content>
  );
};

export default BlogPage;
