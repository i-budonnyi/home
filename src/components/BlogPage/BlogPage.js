// src/components/BlogPage/BlogPage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Layout, Card, Space, Typography, Skeleton, Button, Tag, Input,
  Divider, message, Modal, Tooltip
} from "antd";
import {
  HeartOutlined, HeartFilled, SendOutlined,
  ShareAltOutlined, CopyOutlined, FacebookFilled,
  TwitterOutlined
} from "@ant-design/icons";
import { SendOutlined as TelegramIcon } from "@ant-design/icons";
import axios from "axios";
import io from "socket.io-client";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_BLOG_URL = `${API_BASE}/blogRoutes`;
const API_PROBLEMS_URL = `${API_BASE}/problems`;
const API_LIKE_URL = `${API_BASE}/likeRoutes`;
const API_COMMENT_URL = `${API_BASE}/commentRoutes`;

let socket;

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userId, setUserId] = useState(null);
  const [filteredType, setFilteredType] = useState("all");
  const [shareVisible, setShareVisible] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const commentsEndRef = useRef(null);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = useCallback(() => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ Error decoding token:", error);
    }
  }, []);

  const fetchLikes = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setLikesData((prev) => ({
        ...prev,
        [entry.id]: {
          likesCount: res.data.likesCount || 0,
          userLiked: res.data.likedBy?.some((u) => u.user_id === userId),
        }
      }));
    } catch (err) {
      console.error("❌ fetchLikes:", err);
    }
  }, [userId]);

  const fetchComments = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: res.data.comments || [],
      }));
    } catch (err) {
      console.error(`[fetchComments] entryId=${entry.id}`, err);
    }
  }, []);

  const fetchAllEntries = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`, { headers }),
        axios.get(API_PROBLEMS_URL, { headers }),
      ]);

      const blogs = blogsRes.data.blogs?.map((b) => ({
        ...b,
        entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim(),
      })) || [];

      const ideas = blogsRes.data.ideas?.map((i) => ({
        ...i,
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim(),
      })) || [];

      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim(),
      })) || [];

      const all = [...blogs, ...ideas, ...problems];
      setEntries(all);
      all.forEach((e) => {
        fetchLikes(e);
        fetchComments(e);
      });
    } catch (err) {
      console.error("❌ fetchAllEntries:", err);
      message.error("Не вдалося завантажити записи.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes, fetchComments]);

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
      console.error("[toggleLike] ❌", err);
      message.error("Не вдалося змінити лайк.");
    }
  };

  const handleCommentSubmit = async (entry) => {
    const comment = newComment[entry.id]?.trim();
    if (!comment) return;

    if (!socket || !socket.connected) {
      console.error("❌ Socket не ініціалізовано");
      message.error("Немає WebSocket-з'єднання");
      return;
    }

    try {
      const res = await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        comment
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      const added = res.data?.comment || res.data;
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: [...(prev[entry.id] || []), added],
      }));
      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (err) {
      console.error("[handleCommentSubmit] ❌", err);
      message.error("Не вдалося додати коментар.");
    }
  };

  const handleDeleteComment = async (commentId, entryId) => {
    try {
      await axios.delete(`${API_COMMENT_URL}/${commentId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCommentsData((prev) => ({
        ...prev,
        [entryId]: (prev[entryId] || []).filter((c) => c.id !== commentId),
      }));
      message.success("Коментар видалено.");
    } catch (err) {
      console.error("[handleDeleteComment] ❌", err);
      message.error("Не вдалося видалити коментар.");
    }
  };

  const handleShare = (entry) => {
    setShareLink(`${window.location.origin}/post/${entry.id}`);
    setShareVisible(true);
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

    if (!socket) {
      socket = io("https://backend-avtologistika.onrender.com");
    }

    socket.on("new_comment", ({ entry_id, comment }) => {
      setCommentsData((prev) => ({
        ...prev,
        [entry_id]: [...(prev[entry_id] || []), comment]
      }));
    });

    return () => socket?.disconnect();
  }, [fetchUserId, fetchAllEntries, fetchLikes]);

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
            {entries
              .filter((e) => filteredType === "all" || e.entryType === filteredType)
              .map((entry) => (
                <Card key={entry.id} hoverable onClick={() => openModal(entry)}>
                  <Title level={4}>{entry.title}</Title>
                  <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                  {entry.createdAt && (
                    <Text type="secondary">
                      Опубліковано: {new Date(entry.createdAt).toLocaleDateString("uk-UA")}
                    </Text>
                  )}
                  <br />
                  <Text>{entry.description?.slice(0, 150) || "Без опису…"}</Text>
                  <br />
                  <Space>
                    <Text type="secondary">❤️ {likesData[entry.id]?.likesCount || 0}</Text>
                    <Button type="text" icon={<SendOutlined />} onClick={(e) => { e.stopPropagation(); openModal(entry); }}>
                      Коментарі
                    </Button>
                    <Button type="link" onClick={(e) => { e.stopPropagation(); openModal(entry); }}>
                      Детальніше
                    </Button>
                  </Space>
                </Card>
              ))}
          </Space>

          {/* Modal для запису */}
          <Modal open={modalVisible} title={selectedEntry?.title} onCancel={() => setModalVisible(false)} footer={null}>
            {selectedEntry && (
              <>
                <Tag color={getTagColor(selectedEntry.entryType)}>{selectedEntry.entryType.toUpperCase()}</Tag>
                <Text strong>Автор: {selectedEntry.authorname || "Невідомий"}</Text><br />
                <Text type="secondary">Опубліковано: {new Date(selectedEntry.createdAt).toLocaleDateString("uk-UA")}</Text>
                <Divider />
                <Text>{selectedEntry.description || "Без опису"}</Text>
                <Divider />
                <Space wrap>
                  <Button type="text" onClick={() => toggleLike(selectedEntry)}>
                    {likesData[selectedEntry.id]?.userLiked ? <HeartFilled style={{ color: "red" }} /> : <HeartOutlined />}
                  </Button>
                  <Text>{likesData[selectedEntry.id]?.likesCount || 0} лайків</Text>
                  <Button type="primary" onClick={() => message.success("Підписка оформлена!")}>Підписатися</Button>
                  <Button type="text" icon={<ShareAltOutlined />} onClick={() => handleShare(selectedEntry)} />
                </Space>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {commentsData[selectedEntry.id]?.map((comment) => (
                    <Card key={comment.id} size="small" style={{ backgroundColor: "#f9f9f9" }}>
                      <Space style={{ justifyContent: "space-between", width: "100%" }}>
                        <div>
                          <Text strong>{comment.author_first_name || "Анонім"} {comment.author_last_name || ""}</Text><br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(comment.createdAt).toLocaleString("uk-UA")}
                          </Text><br />
                          <Text>{comment.comment || comment.text}</Text>
                        </div>
                        {comment.user_id === userId && (
                          <Button danger type="link" onClick={() => handleDeleteComment(comment.id, selectedEntry.id)}>
                            Видалити
                          </Button>
                        )}
                      </Space>
                    </Card>
                  ))}
                  <div ref={commentsEndRef} />
                </Space>
                <Divider />
                <Text strong>Додати коментар:</Text>
                <TextArea
                  rows={2}
                  value={newComment[selectedEntry.id] || ""}
                  onChange={(e) =>
                    setNewComment((prev) => ({ ...prev, [selectedEntry.id]: e.target.value }))
                  }
                />
                <Button type="primary" icon={<SendOutlined />} onClick={() => handleCommentSubmit(selectedEntry)}>
                  Відправити
                </Button>
              </>
            )}
          </Modal>

          {/* Modal для поділитися */}
          <Modal title="Поділитися" open={shareVisible} onCancel={() => setShareVisible(false)} footer={null}>
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
              <Tooltip title="X (Twitter)">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TwitterOutlined style={{ fontSize: 28 }} />
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
