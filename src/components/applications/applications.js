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

const { Title }    = Typography;
const { TextArea } = Input;
const { Option }   = Select;

/* ────────────────────────────────────────── */
/* 1. Базові константи                        */
/* ────────────────────────────────────────── */
const API_BASE           = "https://backend-avtologistika.onrender.com";
const APPLICATIONS_URL   = "/api/applicationRoutes"; // ← як у backend/routes/applicationRoutes.js

const buildApiClient = () => {
  const token = localStorage.getItem("token") || "";
  return axios.create({
    baseURL : API_BASE,
    headers : {
      Authorization : `Bearer ${token}`,
      Accept        : "application/json",
      "Content-Type": "application/json",
    },
    withCredentials : false,
  });
};

/* ────────────────────────────────────────── */
/* 2. Головний компонент                      */
/* ────────────────────────────────────────── */
const Applications = () => {
  const nav = useNavigate();
  const [axiosApi] = useState(() => buildApiClient());

  /* 📝 стан заявки */
  const [application, setApplication] = useState({
    title   : "",
    content : "",
    user_id : null,
    idea_id : null,
    type    : "idea",
  });

  /* 🧩 вибрана ідея */
  const [idea, setIdea]       = useState(null);
  const [loading, setLoading] = useState(false);

  /* 🔌 WebSocket */
  const [socket] = useState(() => {
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } });
  });

  /* ──────────────────────────────────────── */
  /*  ініціалізація                          */
  /* ──────────────────────────────────────── */
  useEffect(() => {
    const savedIdea = localStorage.getItem("selectedIdea");
    const savedUser = localStorage.getItem("user");

    const currentUserId =
      savedUser && JSON.parse(savedUser)?.id
        ? Number(JSON.parse(savedUser).id)
        : null;

    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);

      setIdea(parsedIdea);
      setApplication((prev) => ({
        ...prev,
        title   : parsedIdea.title       || "Без назви",
        content : parsedIdea.description || "Без опису",
        user_id : currentUserId,
        idea_id : Number(parsedIdea.id),
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
  /*  submit                                 */
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
      idea_id: type === "idea" ? Number(idea_id) : null,
    };

    console.log("🔍 payload:", payload);

    setLoading(true);

    try {
      console.group("📤 POST", APPLICATIONS_URL);
      const { status, data } = await axiosApi.post(APPLICATIONS_URL, payload);
      console.info("⬅️ status:", status);
      console.debug("⬅️ data  :", data);

      if (status === 200 || status === 201) {
        message.success("✅ Заявку створено успішно!");
        socket.emit("application_created", { ...payload, timestamp: Date.now() });
        nav("/applications");
      } else {
        throw new Error(`Unexpected status ${status}`);
      }
    } catch (err) {
      console.error("❌ error:", err);

      if (err.response?.status === 409) {
        return message.info(
          err.response.data?.message || "Заявка вже існує для цієї ідеї."
        );
      }

      message.error(
        err.response?.data?.message ||
          (err.message.includes("Network")
            ? "Проблеми мережі"
            : "Сталася помилка. Спробуйте пізніше.")
      );
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  /* ──────────────────────────────────────── */
  /*  UI                                     */
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
            onChange={(val) => setApplication({ ...application, type: val })}
          >
            <Option value="idea">Ідея</Option>
            <Option value="problem">Проблема</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmitApplication}
          >
            {loading ? "Надсилання..." : "Створити заявку"}
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Applications;
