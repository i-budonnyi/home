import React, { useEffect, useState, useCallback } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button, Tag, Input,
  Divider, message, Modal, Tooltip
} from "antd";
import {
  HeartOutlined, HeartFilled, SendOutlined,
  ShareAltOutlined, CopyOutlined, FacebookFilled,
  TwitterSquareFilled
} from "@ant-design/icons";
import { SendOutlined as TelegramIcon } from "@ant-design/icons";
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
  const [modalVisible, setModalVisible] = useState(false);

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

  const fetchComments = async (entry) => {
    try {
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`);
      setCommentsData(prev => ({
        ...prev,
        [entry.id]: res.data.comments || [],
      }));
    } catch (err) {
      console.error(`[fetchComments] ❌ Entry ID ${entry.id}:`, err.response?.data || err.message);
    }
  };

  const fetchAllEntries = useCallback(async () => {
    try {
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`),
        axios.get(`${API_PROBLEMS_URL}`),
      ]);

      const blogs = blogsRes.data?.blogs?.map(b => ({
        ...b,
        entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`,
        createdAt: b.createdAt
      })) || [];

      const ideas = blogsRes.data?.ideas?.map(i => ({
        ...i,
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`,
        createdAt: i.createdAt
      })) || [];

      const problems = problemsRes.data?.map(p => ({
        ...p,
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`,
        createdAt: p.createdAt
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

  const toggleLike = async (entry) => {
    try {
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      fetchLikes(entry);
    } catch (err) {
      console.error("[toggleLike] ❌ Error:", err.response?.data || err.message);
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleCommentSubmit = async (entry) => {
    const comment = newComment[entry.id]?.trim();
    if (!comment) return;

    const token = getAuthToken();
    const entryType = entry.entryType.toLowerCase();

    try {
      const res = await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entryType,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("[handleCommentSubmit] ❌ Error:", err.response?.data || err.message);
      message.error("Не вдалося додати коментар.");
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

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setModalVisible(true);
    fetchComments(entry);
  };

  useEffect(() => {
    fetchUserId();
    fetchAllEntries();

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on("new_entry", entry => {
      setEntries(prev => [entry, ...prev]);
    });

    socket.on("new_comment", ({ entryId, comment }) => {
      setCommentsData(prev => ({
        ...prev,
        [entryId]: [...(prev[entryId] || []), comment],
      }));
    });

    return () => {
      socket.disconnect();
    };
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
              <Card key={entry.id} hoverable onClick={() => openModal(entry)}>
                <Title level={4}>{entry.title}</Title>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                <Text type="secondary">
                  Опубліковано: {entry.createdAt && !isNaN(Date.parse(entry.createdAt))
                    ? new Date(entry.createdAt).toLocaleDateString("uk-UA")
                    : "невідомо"}
                </Text><br />
                <Text>{entry.description?.slice(0, 150) || "Без опису..."}</Text><br />
                <Space>
                  <Text type="secondary">❤️ {likesData[entry.id]?.likesCount || 0}</Text>
                  <Button
                    type="text"
                    icon={<SendOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(entry);
                    }}
                  >
                    Коментарі
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>

          <Modal
            open={modalVisible}
            title={selectedEntry?.title}
            onCancel={() => setModalVisible(false)}
            footer={null}
            centered
            width={600}
          >
            {selectedEntry && (
              <>
                <Tag color={getTagColor(selectedEntry.entryType)}>{selectedEntry.entryType.toUpperCase()}</Tag>
                <Text strong>Автор: {selectedEntry.authorname || "Невідомий"}</Text><br />
                <Text type="secondary">
                  Опубліковано: {selectedEntry.createdAt && !isNaN(Date.parse(selectedEntry.createdAt))
                    ? new Date(selectedEntry.createdAt).toLocaleDateString("uk-UA")
                    : "невідомо"}
                </Text>
                <Divider />
                <Text>{selectedEntry.description || "Без опису"}</Text>
                <Divider />
                <Space wrap>
                  <Button type="text" onClick={() => toggleLike(selectedEntry)}>
                    {likesData[selectedEntry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                  </Button>
                  <Text>{likesData[selectedEntry.id]?.likesCount || 0} лайків</Text>
                  <Button type="primary" onClick={() => message.success("Підписка оформлена!")}>Підписатися</Button>
                  <Button type="text" onClick={() => handleShare(selectedEntry)} icon={<ShareAltOutlined />} />
                </Space>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {commentsData[selectedEntry.id]?.length ? (
                    commentsData[selectedEntry.id].map(comment => (
                      <Card key={comment.id} size="small" style={{ backgroundColor: "#f9f9f9" }}>
                        <Text strong>
                          {comment.author_first_name || "Анонім"} {comment.author_last_name || ""}
                        </Text><br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(comment.createdAt).toLocaleString("uk-UA")}
                        </Text><br />
                        <Text>{comment.comment || comment.text}</Text>
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
          </Modal>

          <Modal title="Поділитися" open={shareModalVisible} onCancel={() => setShareModalVisible(false)} footer={null}>
            <Space>
              <Tooltip title="Telegram">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TelegramIcon style={{ fontSize: 28, color: "#229ED9" }} />
                </a>
              </Tooltip>
              <Tooltip title="Facebook">
                <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <FacebookFilled style={{ fontSize: 30, color: "#4267B2" }} />
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
        </>
      )}
    </Content>
  );
};

export default BlogPage;
