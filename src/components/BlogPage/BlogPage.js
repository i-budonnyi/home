import React, { useEffect, useState, useCallback } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button, Tag, Input,
  Divider, message, Modal, Tooltip, Drawer
} from "antd";
import {
  HeartOutlined, HeartFilled, SendOutlined,
  ShareAltOutlined, CopyOutlined, FacebookFilled,
  TwitterSquareFilled, SendOutlined as TelegramIcon
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

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userId, setUserId] = useState(null);
  const [filteredType, setFilteredType] = useState("all");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ Error fetching user ID:", error.message);
    }
  }, []);

  const fetchLikes = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`);
      setLikesData(prev => ({
        ...prev,
        [entry.id]: {
          likesCount: res.data.likesCount || 0,
          userLiked: res.data.likedBy?.some(u => u.user_id === userId)
        },
      }));
    } catch (err) {
      console.error("❌ Error fetching likes:", err);
    }
  }, [userId]);

  const fetchAllEntries = useCallback(async () => {
    try {
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`),
        axios.get(`${API_PROBLEMS_URL}`),
      ]);

      const blogs = blogsRes.data?.blogs?.map(b => ({ ...b, entryType: "blog" })) || [];
      const ideas = blogsRes.data?.ideas?.map(i => ({ ...i, entryType: "idea" })) || [];
      const problems = problemsRes.data?.map(p => ({
        ...p, entryType: "problem", authorname: p.author || "Невідомий"
      })) || [];

      const all = [...blogs, ...ideas, ...problems];
      setEntries(all);
      all.forEach(entry => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("❌ Error fetching entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes]);

  const fetchComments = async (entry) => {
    try {
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`);
      setCommentsData(prev => ({
        ...prev,
        [entry.id]: res.data.comments || [],
      }));
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
    }
  };

  const handleCommentSubmit = async (entry) => {
    const text = newComment[entry.id]?.trim();
    if (!text) return;
    try {
      await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        text,
      });
      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      message.error("Не вдалося додати коментар.");
    }
  };

  const toggleLike = async (entry) => {
    try {
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
      });
      fetchLikes(entry);
    } catch (err) {
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleShare = (entry) => {
    setShareLink(`${window.location.origin}/post/${entry.id}`);
    setShareModalVisible(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      message.success("Скопійовано!");
    } catch {
      message.error("Не вдалося скопіювати.");
    }
  };

  const openDrawer = (entry) => {
    setSelectedEntry(entry);
    setDrawerVisible(true);
  };

  useEffect(() => {
    fetchUserId();
    fetchAllEntries();
    const socket = io(SOCKET_URL);
    socket.on("new_entry", entry => setEntries(prev => [entry, ...prev]));
    socket.on("new_comment", ({ entryId, comment }) => {
      setCommentsData(prev => ({
        ...prev,
        [entryId]: [...(prev[entryId] || []), comment],
      }));
    });
    return () => socket.disconnect();
  }, [fetchUserId, fetchAllEntries]);

  const getTagColor = (type) => {
    if (type === "blog") return "blue";
    if (type === "idea") return "green";
    if (type === "problem") return "gold";
    return "default";
  };

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      {isLoading ? <Skeleton active /> : (
        <>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={5}>Фільтрувати за типом:</Title>
            <Space>
              {["all", "blog", "idea", "problem"].map(type => (
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
            {entries.filter(e => filteredType === "all" || e.entryType === filteredType).map(entry => (
              <Card key={entry.id} hoverable onClick={() => openDrawer(entry)}>
                <Title level={4}>{entry.title}</Title>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
              </Card>
            ))}
          </Space>

          <Modal title="Поділитися" open={shareModalVisible} onCancel={() => setShareModalVisible(false)} footer={null}>
            <Space>
              <Tooltip title="Telegram">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TelegramIcon style={{ fontSize: 28, color: "#229ED9" }} />
                </a>
              </Tooltip>
              <Tooltip title="Facebook">
                <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <FacebookFilled style={{ fontSize: 28, color: "#4267B2" }} />
                </a>
              </Tooltip>
              <Tooltip title="Twitter">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TwitterSquareFilled style={{ fontSize: 28, color: "#1DA1F2" }} />
                </a>
              </Tooltip>
              <Tooltip title="Копіювати посилання">
                <CopyOutlined style={{ fontSize: 24 }} onClick={copyToClipboard} />
              </Tooltip>
            </Space>
          </Modal>

          <Drawer title={selectedEntry?.title} open={drawerVisible} onClose={() => setDrawerVisible(false)} width={500}>
            {selectedEntry && (
              <>
                <Tag color={getTagColor(selectedEntry.entryType)}>{selectedEntry.entryType.toUpperCase()}</Tag>
                <Text strong>Автор: {selectedEntry.authorname || "Невідомий"}</Text>
                <Divider />
                <Text>{selectedEntry.description || "Без опису"}</Text>
                <Divider />
                <Space>
                  <Button type="text" onClick={() => toggleLike(selectedEntry)}>
                    {likesData[selectedEntry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                  </Button>
                  <Text>{likesData[selectedEntry.id]?.likesCount || 0} лайків</Text>
                  <Button type="text" onClick={() => handleShare(selectedEntry)} icon={<ShareAltOutlined />} />
                </Space>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {commentsData[selectedEntry.id]?.length ? (
                    commentsData[selectedEntry.id].map(comment => (
                      <Card key={comment.id} size="small" style={{ backgroundColor: "#f9f9f9" }}>
                        <Text strong>{comment.authorName || "Анонім"}</Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>{new Date(comment.createdAt).toLocaleString("uk-UA")}</Text><br />
                        <Text>{comment.text}</Text>
                      </Card>
                    ))
                  ) : <Text type="secondary">Коментарів ще немає.</Text>}
                </Space>
                <Divider />
                <Text strong>Додати коментар:</Text>
                <TextArea
                  rows={2}
                  value={newComment[selectedEntry.id] || ""}
                  onChange={e => setNewComment(prev => ({ ...prev, [selectedEntry.id]: e.target.value }))}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={() => handleCommentSubmit(selectedEntry)}>Відправити</Button>
              </>
            )}
          </Drawer>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
