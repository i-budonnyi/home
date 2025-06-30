// src/pages/Applications.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Layout,
  Form,
  Input,
  Button,
  message,
  Typography,
  Alert,
  Select,
} from "antd";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const { Title }   = Typography;
const { TextArea} = Input;
const { Option }  = Select;

/* ────────────────────────────────────────── */
/* axios-клієнт із JWT                       */
/* ────────────────────────────────────────── */
const API_BASE = "https://backend-avtologistika.onrender.com";
const api      = () => {
  const token = localStorage.getItem("token") || "";
  return axios.create({
    baseURL : API_BASE,
    headers : { Authorization: `Bearer ${token}` },
  });
};

const Applications = () => {
  const nav = useNavigate();
  const [axiosApi] = useState(() => api());

  /* 📝 стан заявки */
  const [application, setApplication] = useState({
    title   : "",
    content : "",
    user_id : null,
    idea_id : null,
    type    : "idea",
  });

  /* 🧩 вибрана ідея (опціонально) */
  const [idea, setIdea]       = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔌 WebSocket */
  const [socket] = useState(() => {
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } });
  });

  /* ──────────────────────────────────────── */
  /*  1.  Підхоплюємо з localStorage:        */
  /*      – користувача                      */
  /*      – вибрану ідею                     */
  /*  2.  Ініціюємо WS-слухачі               */
  /* ──────────────────────────────────────── */
  useEffect(() => {
    const savedIdea  = localStorage.getItem("selectedIdea");
    const savedUser  = localStorage.getItem("user"); // { id, first_name, ... }

    const currentUserId =
      savedUser && JSON.parse(savedUser)?.id ? Number(JSON.parse(savedUser).id) : null;

    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);

      setIdea(parsedIdea);
      setApplication((prev) => ({
        ...prev,
        title   : parsedIdea.title       || "Без назви",
        content : parsedIdea.description || "Без опису",
        user_id : currentUserId,
        idea_id : Number(parsedIdea.id),               // гарантуємо число
      }));
    } else {
      setApplication((prev) => ({ ...prev, user_id: currentUserId }));
    }

    socket.on("connect", () => console.info("🔌 WS connected:", socket.id));
    socket.on("connect_error", (err) =>
      console.error("❌ WS connect error:", err.message)
    );

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [socket]);

  /* ──────────────────────────────────────── */
  /*  Надсилання заявки                      */
  /* ──────────────────────────────────────── */
  const handleSubmitApplication = async () => {
    const { user_id, title, content, idea_id, type } = application;

    if (!user_id || !title.trim() || !content.trim()) {
      return message.warning("⚠️ Заповніть усі обов’язкові поля.");
    }

    const payload = {
      user_id,
      title  : title.trim(),
      content: content.trim(),
      type,
    };
    if (type === "idea" && idea_id) payload.idea_id = Number(idea_id);

    /* додаткове логування типів, щоб одразу бачити проблему */
    console.log("🧾 payload types:", {
      user_id : typeof payload.user_id,
      title   : typeof payload.title,
      content : typeof payload.content,
      idea_id : typeof payload.idea_id,
      type    : typeof payload.type,
    });

    setLoading(true);

    try {
      console.group("📤 Відправлення заявки");
      console.info("➡️ POST /api/applicationRoutes");
      console.debug("Payload:", payload);

      const { status, data } = await axiosApi.post("/api/applicationRoutes", payload);

      console.info("⬅️ Статус:", status);
      console.debug("📦 Відповідь:", data);

      if (status === 201 || status === 200) {
        message.success("✅ Заявку успішно створено!");
        socket.emit("application_created", { ...payload, timestamp: new Date() });
        nav("/applications");
      } else {
        throw new Error(`📛 Неочікуваний статус: ${status}`);
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА при створенні заявки:");
      if (err.response) {
        console.error("🔴 response.data:",    err.response.data);
        console.error("🔴 response.status:",  err.response.status);
        console.error("🔴 response.headers:", err.response.headers);

        /* friendly повідомлення для 409 дубля */
        if (err.response.status === 409) {
          return message.info(
            err.response.data?.message || "Заявку вже створено для цієї ідеї."
          );
        }
      } else if (err.request) {
        console.error("🟠 request (відправлено, але відповіді немає):", err.request);
      } else {
        console.error("⚠️ Інша помилка:", err.message);
      }

      message.error(
        err.response?.data?.message || "❌ Помилка сервера. Спробуйте пізніше."
      );
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  /* ──────────────────────────────────────── */
  /*               UI                        */
  /* ──────────────────────────────────────── */
  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8", padding: 20 }}>
      <Title level={2}>Створення заявки</Title>

      {idea && (
        <Alert
          message={`Ідея: ${idea.title}`}
          description={idea.description}
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
      )}

      <Form layout="vertical">
        <Form.Item label="Назва">
          <Input
            value={application.title}
            onChange={(e) =>
              setApplication({ ...application, title: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Опис">
          <TextArea
            rows={4}
            value={application.content}
            onChange={(e) =>
              setApplication({ ...application, content: e.target.value })
            }
          />
        </Form.Item>

        <Form.Item label="Тип заявки">
          <Select
            value={application.type}
            onChange={(value) =>
              setApplication({ ...application, type: value })
            }
          >
            <Option value="idea">Ідея</Option>
            <Option value="problem">Проблема</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={handleSubmitApplication}
            loading={loading}
          >
            {loading ? "Надсилання..." : "Створити заявку"}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Applications;
