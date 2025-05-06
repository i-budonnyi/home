import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Typography,
  Input,
  message,
} from "antd";
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
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("\u274C \u041f\u041e\u041c\u0418\u041b\u041a\u0410 \u043e\u0442\u0440\u0438\u043c\u0430\u043d\u043d\u044f ID \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430:", error.message);
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
      console.error(`[\u274C \u041b\u0430\u0439\u043a\u0438] ${entry.id}:`, err);
    }
  }, [userId]);

  const fetchComments = useCallback(async (entry) => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(response.data.comments)) return;
      setCommentsData((prev) => ({
        ...prev,
        [entry.id]: response.data.comments,
      }));
    } catch (err) {
      console.error(`[\u274C \u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456] ${entry.id}:`, err);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_SUBSCRIBE_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const subs = response.data.subscriptions.reduce((acc, sub) => {
        acc[sub.blog_id || sub.idea_id || sub.problem_id] = true;
        return acc;
      }, {});
      setSubscribedEntries(subs);
    } catch (err) {
      console.error("\u274C \u041f\u043e\u043c\u0438\u043b\u043a\u0430 \u043f\u0456\u0434\u043f\u0438\u0441\u043e\u043a:", err);
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
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim() || b.author_email || "\u041d\u0435\u0432\u0456\u0434\u043e\u043c\u0438\u0439",
      })) || [];

      const ideas = blogsRes.data?.ideas?.map((i) => ({
        ...i,
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim() || i.author_email || "\u041d\u0435\u0432\u0456\u0434\u043e\u043c\u0438\u0439",
      })) || [];

      const problems = problemsRes.data?.map((p) => ({
        ...p,
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim() || p.author || "\u041d\u0435\u0432\u0456\u0434\u043e\u043c\u0438\u0439",
      })) || [];

      const allEntries = [...blogs, ...ideas, ...problems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEntries(allEntries);

      allEntries.forEach((entry) => {
        fetchLikes(entry);
        fetchComments(entry);
      });
    } catch (err) {
      console.error("\u274C \u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u0437\u0430\u043f\u0438\u0441\u0456\u0432:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchLikes, fetchComments]);

  const handleCommentSubmit = async (entry) => {
    const text = newComment[entry.id]?.trim();
    if (!text) return;
    try {
      const token = getAuthToken();
      await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        text,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewComment((prev) => ({ ...prev, [entry.id]: "" }));
      fetchComments(entry);
    } catch (err) {
      console.error("\u274C \u041f\u043e\u043c\u0438\u043b\u043a\u0430 \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u043a\u0438 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u044f:", err.response?.data || err.message);
      message.error("\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0434\u043e\u0434\u0430\u0442\u0438 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440.");
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

  return (
    <Content>
      <Title level={3}>Сторінка блогу</Title>
      {/* ТУТ БУДЕ РЕНДЕР КАРТОК ТА UI */}
    </Content>
  );
};

export default BlogPage;