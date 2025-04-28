import React, { useEffect, useState, useCallback } from "react"; // 🔥 додали useCallback
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

// ✅ ОНОВЛЕНО ПІД RENDER
const API_BASE = "https://idea-backend.onrender.com/api";
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

  // 🔥 Обгорнули в useCallback
  const fetchUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ ПОМИЛКА отримання ID користувача:", error.message);
    }
  }, []);

  const fetchAllEntries = useCallback(async () => {
    try {
      const [blogsRes, problemsRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`),
        axios.get(`${API_PROBLEMS_URL}`),
      ]);

      const blogs = blogsRes.data?.blogs?.map((b) => ({ ...b, entryType: "blog" })) || [];
      const ideas = blogsRes.data?.ideas?.map((i) => ({ ...i, entryType: "idea" })) || [];
      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: p.author || "Невідомий",
      })) || [];

      const allEntries = [...blogs, ...ideas, ...problems];
      setEntries(allEntries);

      allEntries.forEach((entry) => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("❌ Не вдалося завантажити дані:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLikes = async (entry) => {
    try {
      const response = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`);
      setLikesData((prev) => ({
        ...prev,
        [entry.id]: {
          likesCount: response.data.likesCount || 0,
          userLiked: response.data.likedBy?.some((user) => user.user_id === userId),
        },
      }));
    } catch (err) {
      console.error(`❌ Помилка отримання лайків:`, err);
    }
  };

  const toggleLike = async (entry) => {
    try {
      if (!entry.id || !entry.entryType) return;
      const response = await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
      });
      if (response.status === 200 || response.status === 201) fetchLikes(entry);
    } catch (err) {
      console.error(`❌ Помилка лайкування:`, err);
      message.error("Не вдалося змінити лайк.");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API_SUBSCRIBE_URL}/user-subscriptions`);
      const subscriptions = response.data.subscriptions.reduce((acc, sub) => {
        acc[sub.blog_id || sub.idea_id || sub.problem_id] = true;
        return acc;
      }, {});
      setSubscribedEntries(subscriptions);
    } catch (err) {
      console.error("❌ Помилка підписок:", err);
    }
  };

  const handleSubscribe = async (entry) => {
    try {
      const isSubscribed = subscribedEntries[entry.id];
      const response = await axios({
        method: isSubscribed ? "delete" : "post",
        url: `${API_SUBSCRIBE_URL}/${isSubscribed ? "unsubscribe" : "subscribe"}`,
        data: { entry_id: entry.id, entry_type: entry.entryType },
      });

      if (response.status === 200 || response.status === 201) {
        setSubscribedEntries((prev) => ({
          ...prev,
          [entry.id]: !isSubscribed,
        }));
        message.success(response.data.message);
      }
    } catch (err) {
      console.error("❌ Помилка підписки/відписки:", err);
      message.error("Не вдалося виконати операцію.");
    }
  };

  const fetchComments = async (entry) => {
    try {
      const response = await axios.get(`${API_COMMENT_URL}/${entry.id}`);
      if (!response.data || !Array.isArray(response.data.comments)) return;
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: response.data.comments,
      }));
    } catch (err) {
      console.error(`❌ Помилка коментарів:`, err);
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
      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("❌ Помилка додавання коментаря:", err);
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

  const filteredEntries =
    filteredType === "all" ? entries : entries.filter((e) => e.entryType === filteredType);

  // 🔥 Виправлений useEffect із правильними залежностями
  useEffect(() => {
    fetchUserId();
    fetchAllEntries();
    fetchSubscriptions();
  }, [fetchUserId, fetchAllEntries]); // 🔥 додано fetchUserId і fetchAllEntries

  return (
    <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <>
          {/* решта твого коду залишається без змін */}
        </>
      )}
    </Content>
  );
};

export default BlogPage;
