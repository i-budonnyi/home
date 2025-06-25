/* eslint-disable no-unused-vars */
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
const API_SUBSCRIPTION_URL = `${API_BASE}/subscriptionRoutes`;

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
  const [subscribedEntries, setSubscribedEntries] = useState({});
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

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_SUBSCRIPTION_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      const subscriptions = res.data?.subscriptions || [];
      const map = {};
      subscriptions.forEach((s) => {
        map[s.entry_id] = true;
      });
      setSubscribedEntries(map);
    } catch (err) {
      console.error("❌ fetchSubscriptions:", err);
    }
  }, []);

  const toggleSubscription = async (entry) => {
    const isSubscribed = subscribedEntries[entry.id];
    const entryType = entry.entryType;

    if (!entryType || !["blog", "idea", "problem"].includes(entryType)) {
      console.error("❌ Некоректний entryType:", entryType);
      message.error("Помилка: тип запису не вказано або неправильний.");
      return;
    }

    const url = `${API_SUBSCRIPTION_URL}/${isSubscribed ? "unsubscribe" : "subscribe"}`;

    try {
      await axios({
        method: isSubscribed ? "delete" : "post",
        url,
        data: { entry_id: entry.id, entry_type: entryType },
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      const updatedSubs = {
        ...subscribedEntries,
        [entry.id]: !isSubscribed
      };
      setSubscribedEntries(updatedSubs);

      if (selectedEntry && selectedEntry.id === entry.id) {
        setSelectedEntry({ ...entry });
      }

      message.success(isSubscribed ? "Відписано" : "Підписано");
    } catch (err) {
      console.error("❌ toggleSubscription:", err?.response?.data || err.message);
      message.error("Не вдалося змінити підписку.");
    }
  };

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

    try {
      const res = await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        comment
      }, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });

      const added = res.data?.comment;
      if (!added) throw new Error("Сервер не повернув коментар");

      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: [...(prev[entry.id] || []), added],
      }));
      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);

      if (socket && socket.connected) {
        socket.emit("new_comment", {
          entry_id: entry.id,
          comment: added,
        });
      }
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
    fetchSubscriptions();

    if (!socket || !socket.connected) {
      socket = io("https://backend-avtologistika.onrender.com", {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        timeout: 10000
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected");
      });

      socket.on("connect_error", (err) => {
        console.error("❌ WebSocket connect error:", err);
      });

      socket.on("new_comment", ({ entry_id, comment }) => {
        setCommentsData((prev) => ({
          ...prev,
          [entry_id]: [...(prev[entry_id] || []), comment]
        }));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
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
          {/* фільтри + список */}
          {/* ... */}
          {/* ❗ У MODAL додаємо змінну кнопку */}
          <Modal open={modalVisible} title={selectedEntry?.title} onCancel={() => setModalVisible(false)} footer={null}>
            {selectedEntry && (
              <>
                {/* інші кнопки */}
                <Button
                  type="primary"
                  onClick={() => toggleSubscription(selectedEntry)}
                >
                  {subscribedEntries[selectedEntry.id] ? "Відписатися" : "Підписатися"}
                </Button>
              </>
            )}
          </Modal>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
