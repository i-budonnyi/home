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

const API_BASE             = "https://backend-avtologistika.onrender.com/api";
const API_BLOG_URL         = `${API_BASE}/blogRoutes`;
const API_PROBLEMS_URL     = `${API_BASE}/problems`;
const API_LIKE_URL         = `${API_BASE}/likeRoutes`;
const API_COMMENT_URL      = `${API_BASE}/commentRoutes`;
const API_SUBSCRIPTION_URL = `${API_BASE}/subscriptionRoutes`;

let socket;

const BlogPage = () => {
  const [entries,            setEntries]            = useState([]);
  const [isLoading,          setIsLoading]          = useState(true);
  const [likesData,          setLikesData]          = useState({});
  const [commentsData,       setCommentsData]       = useState({});
  const [newComment,         setNewComment]         = useState({});
  const [userId,             setUserId]             = useState(null);
  const [filteredType,       setFilteredType]       = useState("all");
  const [shareVisible,       setShareVisible]       = useState(false);
  const [shareLink,          setShareLink]          = useState("");
  const [selectedEntry,      setSelectedEntry]      = useState(null);
  const [modalVisible,       setModalVisible]       = useState(false);
  const [subscribedEntries,  setSubscribedEntries]  = useState({});
  const commentsEndRef = useRef(null);

  const getAuthToken = () => localStorage.getItem("token");


  const fetchUserId = useCallback(() => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      setUserId(decoded?.user_id || decoded?.id || null);
    } catch {}
  }, []);

    const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_SUBSCRIPTION_URL}/user-subscriptions`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      const map = {};
      res.data?.forEach(s => { map[s.entry_id] = true; });
      setSubscribedEntries(map);
    } catch {}
  }, []);

  const toggleSubscription = async (entry) => {
    const isSub = subscribedEntries[entry.id];
    try {
      await axios({
        method : isSub ? "delete" : "post",
        url    : `${API_SUBSCRIPTION_URL}/${isSub ? "unsubscribe" : "subscribe"}`,
        data   : { entry_id: entry.id, entry_type: entry.entryType },
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setSubscribedEntries(prev => ({ ...prev, [entry.id]: !isSub }));
      message.success(isSub ? "Відписано" : "Підписано");
    } catch (e) {
      message.error("Помилка підписки");
    }
  };

  const fetchLikes = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_LIKE_URL}/likes/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setLikesData(prev => ({
        ...prev,
        [entry.id]: {
          likesCount: res.data.likesCount || 0,
          userLiked : res.data.likedBy?.some(u => u.user_id === userId)
        }
      }));
    } catch {}
  }, [userId]);

  const toggleLike = async (entry) => {
    try {
      await axios.post(`${API_LIKE_URL}/toggle-like`, {
        entry_id: entry.id,
        entry_type: entry.entryType
      }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
      fetchLikes(entry);
    } catch { message.error("Не вдалося змінити лайк"); }
  };

   const fetchComments = useCallback(async (entry) => {
    try {
      const res = await axios.get(`${API_COMMENT_URL}/${entry.id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCommentsData(prev => ({ ...prev, [entry.id]: res.data.comments || [] }));
    } catch {}
  }, []);

  const handleCommentSubmit = async (entry) => {
    const text = newComment[entry.id]?.trim();
    if (!text) return;
    try {
      const res = await axios.post(`${API_COMMENT_URL}/add`, {
        entry_id: entry.id,
        entry_type: entry.entryType,
        comment: text
      }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });

      const added = res.data?.comment;
      if (!added) throw new Error();
      setCommentsData(prev => ({ ...prev, [entry.id]: [...(prev[entry.id] || []), added] }));
      setNewComment(prev => ({ ...prev, [entry.id]: "" }));
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { message.error("Не вдалося додати"); }
  };

  const handleDeleteComment = async (cid, eid) => {
    try {
      await axios.delete(`${API_COMMENT_URL}/${cid}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` }
      });
      setCommentsData(prev => ({
        ...prev,
        [eid]: prev[eid]?.filter(c => c.id !== cid) || []
      }));
    } catch { message.error("Не вдалося видалити"); }
  };

  const fetchAllEntries = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const [bRes, pRes] = await Promise.all([
        axios.get(`${API_BLOG_URL}/entries`, { headers }),
        axios.get(API_PROBLEMS_URL, { headers })
      ]);

      const blogs = (bRes.data.blogs || []).map(b => ({
        ...b,
        id: b.id,                   // ID з таблиці blogs
        entryType: "blog",
        authorname: `${b.author_first_name || ""} ${b.author_last_name || ""}`.trim()
      }));

      const ideas = (bRes.data.ideas || []).map(i => ({
        ...i,
        id: i.id,                   // ID з таблиці ideas
        entryType: "idea",
        authorname: `${i.author_first_name || ""} ${i.author_last_name || ""}`.trim()
      }));

      const problems = (pRes.data || []).map(p => ({
        ...p,
        id: p.id,                   // ID з таблиці problems
        entryType: "problem",
        authorname: `${p.author_first_name || ""} ${p.author_last_name || ""}`.trim()
      }));

      const all = [...blogs, ...ideas, ...problems];
      setEntries(all);
      all.forEach(e => { fetchLikes(e); fetchComments(e); });
    } catch { message.error("Помилка завантаження"); }
    finally { setIsLoading(false); }
  }, [fetchLikes, fetchComments]);

    useEffect(() => {
    fetchUserId();
    fetchAllEntries();
    fetchSubscriptions();

    if (!socket) {
      socket = io("https://backend-avtologistika.onrender.com", {
        transports: ["websocket"], reconnectionAttempts: 3, timeout: 1e4
      });
      socket.on("new_comment", ({ entry_id, comment }) => {
        setCommentsData(prev => ({ ...prev, [entry_id]: [...(prev[entry_id] || []), comment] }));
      });
    }
    return () => { socket?.disconnect(); socket = null; };
  }, [fetchUserId, fetchAllEntries, fetchSubscriptions]);

  /* ---------------------------- UI ----------------------------- */
  const getTagColor = (t) => (t === "blog" ? "blue" : t === "idea" ? "green" : "gold");

  return (
    <Content style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      {isLoading ? <Skeleton active /> : (
        <>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Title level={5}>Фільтрувати за типом:</Title>
            <Space>
              {["all", "blog", "idea", "problem"].map(t => (
                <Button key={t} type={filteredType === t ? "primary" : "default"} onClick={() => setFilteredType(t)}>
                  {t === "all" ? "Усі" : t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </Space>
          </div>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {entries.filter(e => filteredType === "all" || e.entryType === filteredType).map(entry => (
              <Card key={entry.id} hoverable onClick={() => { setSelectedEntry(entry); setModalVisible(true); }}>
                <Title level={4}>{entry.title}</Title>
                <Tag color={getTagColor(entry.entryType)}>{entry.entryType.toUpperCase()}</Tag>
                {entry.createdAt && (
                  <Text type="secondary">
                    Опубліковано: {new Date(entry.createdAt).toLocaleDateString("uk-UA")}
                  </Text>
                )}
                <br />
                <Text>{entry.description?.slice(0,150) || "Без опису…"}</Text><br />
                <Space>
                  <Text type="secondary">❤️ {likesData[entry.id]?.likesCount || 0}</Text>
                  <Button type="text" icon={<SendOutlined />} onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry); setModalVisible(true); }}>
                    Коментарі
                  </Button>
                </Space>
              </Card>
            ))}
          </Space>

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
                    {likesData[selectedEntry.id]?.userLiked ? <HeartFilled style={{ color: "red" }}/> : <HeartOutlined />}
                  </Button>
                  <Text>{likesData[selectedEntry.id]?.likesCount || 0} лайків</Text>
                  <Button type="primary" onClick={() => toggleSubscription(selectedEntry)}>
                    {subscribedEntries[selectedEntry.id] ? "Відписатися" : "Підписатися"}
                  </Button>
                  <Button type="text" icon={<ShareAltOutlined />} onClick={() => { setShareLink(`${window.location.origin}/post/${selectedEntry.id}`); setShareVisible(true); }}/>
                </Space>
                <Divider />
                <Title level={5}>Коментарі:</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {(commentsData[selectedEntry.id] || []).map(c => (
                    <Card key={c.id} size="small" style={{ backgroundColor:"#f9f9f9" }}>
                      <Space style={{ justifyContent:"space-between", width:"100%" }}>
                        <div>
                          <Text strong>{c.author_first_name || "Анонім"} {c.author_last_name || ""}</Text><br />
                          <Text type="secondary" style={{ fontSize:12 }}>
                            {new Date(c.createdAt).toLocaleString("uk-UA")}
                          </Text><br />
                          <Text>{c.comment || c.text}</Text>
                        </div>
                        {c.user_id === userId && (
                          <Button danger type="link" onClick={() => handleDeleteComment(c.id, selectedEntry.id)}>Видалити</Button>
                        )}
                      </Space>
                    </Card>
                  ))}
                  <div ref={commentsEndRef} />
                </Space>
                <Divider />
                <Text strong>Додати коментар:</Text>
                <TextArea rows={2} value={newComment[selectedEntry.id] || ""} onChange={e => setNewComment(p => ({ ...p, [selectedEntry.id]: e.target.value }))}/>
                <Button type="primary" icon={<SendOutlined />} onClick={() => handleCommentSubmit(selectedEntry)}>Відправити</Button>
              </>
            )}
          </Modal>

          <Modal title="Поділитися" open={shareVisible} onCancel={() => setShareVisible(false)} footer={null}>
            <Space>
              <Tooltip title="Telegram">
                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TelegramIcon style={{ fontSize:28, color:"#229ED9" }} />
                </a>
              </Tooltip>
              <Tooltip title="Facebook">
                <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <FacebookFilled style={{ fontSize:30, color:"#4267B2" }} />
                </a>
              </Tooltip>
              <Tooltip title="X (Twitter)">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer">
                  <TwitterOutlined style={{ fontSize:28 }} />
                </a>
              </Tooltip>
              <Tooltip title="Копіювати посилання">
                <CopyOutlined style={{ fontSize:24 }} onClick={async () => { try { await navigator.clipboard.writeText(shareLink); message.success("Скопійовано!"); } catch { message.error("Не вдалося"); } }} />
              </Tooltip>
            </Space>
          </Modal>
        </>
      )}
    </Content>
  );
};

export default BlogPage;
