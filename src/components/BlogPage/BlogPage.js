import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_BLOG_URL = `${API_BASE}/blogRoutes`;
const API_PROBLEMS_URL = `${API_BASE}/problems`;
const API_LIKE_URL = `${API_BASE}/likeRoutes`;
const API_COMMENT_URL = `${API_BASE}/commentRoutes`;
const API_SUBSCRIBE_URL = `${API_BASE}/subscriptionRoutes`;

const BlogPage = () => {
  const [userId, setUserId] = useState(null);
  const [newComment, setNewComment] = useState({});

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = useCallback(() => {
    try {
      const token = getAuthToken();
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ Помилка отримання ID користувача:", error.message);
    }
  }, []);

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
      // fetchComments(entry); // якщо буде реалізовано
    } catch (err) {
      console.error("❌ Помилка відправки коментаря:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  // UI поки відсутній, щоб уникнути unused-помилок
  return <div>BlogPage працює. UI ще не підключений.</div>;
};

export default BlogPage;
