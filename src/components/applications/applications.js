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
/*  1. Базові константи й DEBUG-утиліти       */
/* ────────────────────────────────────────── */
const API_BASE         = "https://backend-avtologistika.onrender.com";
const APPLICATIONS_URL = "/api/applicationRoutes";

const STEP = (label, data = null) => {
  const time = new Date().toISOString().split("T")[1].slice(0, 12);
  if (data !== null) {
    console.log(`[%c${time}%c] %c${label}`, "color:#999", "", "color:#00b", data);
  } else {
    console.log(`[%c${time}%c] %c${label}`, "color:#999", "", "color:#00b");
  }
};

const buildApiClient = () => {
  STEP("Axios → створення інстанса");
  const token = localStorage.getItem("token") || "";
  const instance = axios.create({
    baseURL : API_BASE,
    headers : {
      Authorization : `Bearer ${token}`,
      Accept        : "application/json",
      "Content-Type": "application/json",
    },
    withCredentials : false,
    validateStatus  : () => true, // дозволяє вручну обробити будь-який статус
  });

  /* Запит */
  instance.interceptors.request.use((cfg) => {
    STEP("Axios → запит", { method: cfg.method, url: cfg.url, data: cfg.data });
    return cfg;
  });

  /* Відповідь  */
  instance.interceptors.response.use(
    (res) => {
      STEP("Axios → відповідь", { status: res.status, data: res.data });
      return res;
    },
    (err) => {
      STEP("Axios → помилка", err);
      return Promise.reject(err);
    }
  );

  return instance;
};

/* ────────────────────────────────────────── */
/*  2. Головний компонент                     */
/* ────────────────────────────────────────── */
const Applications = () => {
  STEP("Компонент Applications → Mount");
  const nav = useNavigate();
  const [axiosApi] = useState(() => buildApiClient());

  /* Стан заявки */
  const [application, setApplication] = useState({
    title   : "",
    content : "",
    user_id : null,
    idea_id : null,
    type    : "idea",
  });

  /* Локальний стан */
  const [idea, setIdea]       = useState(null);
  const [loading, setLoading] = useState(false);

  /* WebSocket */
  const [socket] = useState(() => {
    STEP("WS → ініціалізація");
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } });
  });

  /* ──────────────────────────────────────── */
  /*  3. Ініціалізація при Mount             */
  /* ──────────────────────────────────────── */
  useEffect(() => {
    STEP("useEffect → старт");

    /* user_id */
    const savedUser = localStorage.getItem("user");
    const currentUserId =
      savedUser && JSON.parse(savedUser)?.id
        ? Number(JSON.parse(savedUser).id)
        : null;
    STEP("user_id →", currentUserId);

    /* selectedIdea */
    const savedIdea = localStorage.getItem("selectedIdea");
    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);
      STEP("selectedIdea знайдено", parsedIdea);
      setIdea(parsedIdea);

      setApplication((prev) => ({
        ...prev,
        title   : parsedIdea.title       || "Без назви",
        content : parsedIdea.description || "Без опису",
        user_id : currentUserId,
        idea_id : Number(parsedIdea.id),
      }));
    } else {
      STEP("selectedIdea не знайдено");
      setApplication((prev) => ({ ...prev, user_id: currentUserId }));
    }

    /* WS listeners */
    socket.on("connect", () => STEP("WS → connect", socket.id));
    socket.on("connect_error", (err) => STEP("WS → connect_error", err.message));

    return () => {
      STEP("Компонент Applications → Unmount");
      socket.off();
      socket.disconnect();
    };
  }, [socket]);

  /* ──────────────────────────────────────── */
  /*  4. Надсилання заявки                   */
  /* ──────────────────────────────────────── */
  const handleSubmitApplication = async () => {
    STEP("handleSubmitApplication → старт");

    const { user_id, title, content, idea_id, type } = application;
    STEP("Перевірка обов'язкових полів", { user_id, title, content });

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
    STEP("payload сформовано", payload);

    setLoading(true);

    try {
      STEP("Запит → POST " + APPLICATIONS_URL);
      const { status, data } = await axiosApi.post(APPLICATIONS_URL, payload);

      STEP("Відповідь отримано", { status, data });

      if (status === 200 || status === 201) {
        message.success("✅ Заявку створено успішно!");
        socket.emit("application_created", { ...payload, timestamp: Date.now() });
        nav("/applications");
      } else if (status === 409) {
        message.info(data?.message || "Заявка вже існує для цієї ідеї.");
      } else {
        throw new Error(`Непередбачений статус ${status}`);
      }
    } catch (err) {
      STEP("catch → AxiosError", err);

      const resp = err.response;
      const net  = err.message?.includes("Network") ? " (Network)" : "";

      message.error(
        resp?.data?.message ||
          `Сталася помилка${net}. Спробуйте пізніше.`
      );
    } finally {
      setLoading(false);
      STEP("handleSubmitApplication → завершено");
    }
  };

  /* ──────────────────────────────────────── */
  /* 5. UI                                   */
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
