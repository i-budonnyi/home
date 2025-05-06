// 🧠 Оновлений BlogPage.jsx з повним логуванням
import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Card,
  Space,
  Typography,
  Skeleton,
  Button,
  Tag,
  Input,
  Divider,
  message,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  UserAddOutlined,
  SendOutlined,
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

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userId, setUserId] = useState(null);
  const [filteredType, setFilteredType] = useState("all");

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      console.log("[DEBUG] Токен у localStorage:", token);
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      console.log("[DEBUG] Декодований токен:", decoded);
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ ПОМИЛКА отримання ID користувача:", error.message);
    }
  }, []);

  const fetchLikes = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikesData((prev) => ({
        ...prev,
        [entry.id]: {
          likesCount: response.data.likesCount || 0,
          userLiked: response.data.likedBy?.some((user) => user.user_id === userId),
        },
      }));
    } catch (err) {
      console.error(`[❌ Лайки] ${entry.id}:`, err);
    }
  }, [userId]);

  const fetchComments = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      console.log("[DEBUG] Токен перед запитом на коментарі:", token);
      if (!token) return;
      const response = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[DEBUG] Коментарі отримано:", response.data);
      if (!Array.isArray(response.data.comments)) return;
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: response.data.comments,
      }));
    } catch (err) {
      console.error(`[❌ Коментарі] ${entry.id}:`, err);
    }
  }, []);

  const fetchAllEntries = useCallback(async () => {
    try {
      const token = getAuthToken();
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_PROBLEMS_URL}`),
      ]);

      const blogs = blogsRes.data?.blogs?.map((b) => ({
        ...b,
        entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim() || b.author_email || "Невідомий",
      })) || [];

      const ideas = blogsRes.data?.ideas?.map((i) => ({
        ...i,
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim() || i.author_email || "Невідомий",
      })) || [];

      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim() || p.author || "Невідомий",
      })) || [];

      const allEntries = [...blogs, ...ideas, ...problems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setEntries(allEntries);
      allEntries.forEach((entry) => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("❌ Завантаження записів:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes, fetchComments]);

  const handleCommentSubmit = async (entry) => {
    const text = newComment[entry.id]?.trim();
    if (!text) return;
    try {
      const token = getAuthToken();
      console.log("[DEBUG] Токен перед відправкою:", token);
      console.log("[DEBUG] Дані, що відправляються:", {
        entry_id: entry.id,
        entry_type: entry.entryType,
        text,
      });

      await axios.post(
        `${API_COMMENT_URL}/add`,
        {
          entry_id: entry.id,
          entry_type: entry.entryType,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("❌ Помилка відправки коментаря:", err.response?.data || err.message);
      message.error("Не вдалося додати коментар.");
    }
  };

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    if (userId) {
      fetchAllEntries();
      fetchSubscriptions();
    }
  }, [userId, fetchAllEntries, fetchSubscriptions]);

  // 🔁 Інші функції (лайки, підписки, getTagColor) не змінювались

  return (<div>... UI ...</div>);
};

export default BlogPage;
