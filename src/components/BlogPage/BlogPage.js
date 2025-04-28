import React, { useEffect, useState } from "react";
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

const API_BLOG_URL = "http://192.168.0.116:5000/api/blogRoutes";
const API_PROBLEMS_URL = "http://192.168.0.116:5000/api/problems";
const API_LIKE_URL = "http://192.168.0.116:5000/api/likeRoutes";
const API_COMMENT_URL = "http://192.168.0.116:5000/api/commentRoutes";
const API_SUBSCRIBE_URL = "http://192.168.0.116:5000/api/subscriptionRoutes";

const BlogPage = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likesData, setLikesData] = useState({});
  const [subscribedEntries, setSubscribedEntries] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [newComment, setNewComment] = useState({});
  const [userId, setUserId] = useState(null);
  const [filteredType, setFilteredType] = useState("all");

  useEffect(() => {
    fetchUserId();
    fetchAllEntries();
    fetchSubscriptions();
  }, []);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserId = () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch (error) {
      console.error("❌ ПОМИЛКА отримання ID користувача:", error.message);
    }
  };

  const fetchAllEntries = async () => {
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
  };

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

  return (
    <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
      {isLoading ? (
        <Skeleton active />
      ) : (
        <>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
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
            {filteredEntries.map((entry) => (
              <Card key={entry.id} hoverable style={{ borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Title level={4} style={{ margin: 0 }}>{entry.title}</Title>
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => handleSubscribe(entry)}
                  >
                    {subscribedEntries[entry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <Tag color={getTagColor(entry.entryType)}>
                    {entry.entryType.toUpperCase()}
                  </Tag>
                  <Text strong style={{ color: "#555" }}>Автор: {entry.authorname || "Невідомий"}</Text>
                </div>

                <Divider style={{ margin: "8px 0" }} />
                <Text>{entry.description || "Без опису"}</Text>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <Space>
                    <Button type="text" onClick={() => toggleLike(entry)}>
                      {likesData[entry.id]?.userLiked ? (
                        <HeartFilled style={{ color: "red" }} />
                      ) : (
                        <HeartOutlined />
                      )}
                    </Button>
                    <Text>{likesData[entry.id]?.likesCount || 0} лайк(ів)</Text>
                  </Space>
                </div>

                <Divider />

                <div style={{ marginBottom: "16px" }}>
                  <Title level={5}>Коментарі:</Title>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {commentsData[entry.id]?.length ? (
                      commentsData[entry.id].map((comment) => (
                        <Card
                          key={comment.id}
                          size="small"
                          style={{
                            backgroundColor: "#fafafa",
                            border: "1px solid #eee",
                            borderRadius: "6px",
                            padding: "12px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <Text strong>{comment.authorName || "Анонім"}</Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {new Date(comment.createdAt).toLocaleString("uk-UA")}
                            </Text>
                          </div>
                          <Text>{comment.text}</Text>
                        </Card>
                      ))
                    ) : (
                      <Text type="secondary">Коментарів ще немає.</Text>
                    )}
                  </Space>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <Text strong>Додати коментар:</Text>
                  <TextArea
                    rows={2}
                    value={newComment[entry.id] || ""}
                    onChange={(e) =>
                      setNewComment({ ...newComment, [entry.id]: e.target.value })
                    }
                    placeholder="Напишіть коментар..."
                    style={{ marginTop: "8px", marginBottom: "8px" }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleCommentSubmit(entry)}
                  >
                    Відправити
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
