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
/* 1. Константи, утиліти та Axios-інтерсептор */
/* ────────────────────────────────────────── */
const API_BASE         = "https://backend-avtologistika.onrender.com";
const APPLICATIONS_URL = "/api/applicationRoutes";

/* Кольорова консоль-utility з часовою міткою */
const log = (label, data = undefined) => {
  const time = new Date().toISOString().split("T")[1].slice(0, 8);
  if (data !== undefined) {
    console.log(
      `%c[${time}] %c${label}:`,
      "color:#999",
      "color:#00a",
      data
    );
  } else {
    console.log(`%c[${time}] %c${label}`, "color:#999", "color:#00a");
  }
};

const buildApiClient = () => {
  const token = localStorage.getItem("token") || "";
  const instance = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    validateStatus: () => true, // обробити будь-який статус у then
    withCredentials: false,
  });

  /* Логування запиту */
  instance.interceptors.request.use((cfg) => {
    log("Axios → Request", { method: cfg.method, url: cfg.url, data: cfg.data });
    return cfg;
  });

  /* Логування відповіді/помилки */
  instance.interceptors.response.use(
    (res) => {
      log("Axios → Response", { status: res.status, data: res.data });
      return res;
    },
    (err) => {
      log("Axios → Error", err);
      return Promise.reject(err);
    }
  );

  return instance;
};

/* ────────────────────────────────────────── */
/* 2. Головний компонент                      */
/* ────────────────────────────────────────── */
const Applications = () => {
  log("Компонент Applications ▸ Mount");

  const nav = useNavigate();
  const [axiosApi] = useState(() => buildApiClient());

  /* Стан заявки */
  const [application, setApplication] = useState({
    title: "",
    content: "",
    user_id: null,
    idea_id: null,
    type: "idea",
  });

  /* Локальний стан */
  const [idea, setIdea]       = useState(null);
  const [loading, setLoading] = useState(false);

  /* WebSocket */
  const [socket] = useState(() => {
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } });
  });

  /* ініціалізація */
  useEffect(() => {
    log("useEffect ▸ старт");

    const savedIdea  = localStorage.getItem("selectedIdea");
    const savedUser  = localStorage.getItem("user");
    const currentUID =
      savedUser && JSON.parse(savedUser)?.id
        ? Number(JSON.parse(savedUser).id)
        : null;

    log("user_id", currentUID);

    if (savedIdea) {
      const parsed = JSON.parse(savedIdea);
      log("selectedIdea знайдено", parsed);

      setIdea(parsed);
      setApplication((prev) => ({
        ...prev,
        title   : parsed.title       || "Без назви",
        content : parsed.description || "Без опису",
        user_id : currentUID,
        idea_id : Number(parsed.id),
      }));
    } else {
      setApplication((prev) => ({ ...prev, user_id: currentUID }));
      log("selectedIdea відсутня");
    }

    socket.on("connect",     () => log("WS connected", socket.id));
    socket.on("connect_error", (e) => log("WS error", e.message));

    return () => {
      socket.off();
      socket.disconnect();
      log("WS disconnected");
    };
  }, [socket]);

  /* ──────────────────────────────────────── */
  /*  submit                                 */
  /* ──────────────────────────────────────── */
  const handleSubmitApplication = async () => {
    if (loading) return; // захист від повторних кліків

    log("handleSubmitApplication ▸ START");
    const { user_id, title, content, idea_id, type } = application;

    /* Перевірка обов’язкових полів */
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
    log("payload", payload);

    setLoading(true);

    try {
      const { status, data } = await axiosApi.post(APPLICATIONS_URL, payload);

      if (status === 200 || status === 201) {
        message.success("✅ Заявку створено успішно!");

        try {
          log("WS emit application_created");
          socket.emit("application_created", { ...payload, timestamp: Date.now() });
        } catch (wsErr) {
          log("WS emit error", wsErr.message);
        }

        nav("/applications");
      } else if (status === 409) {
        message.info(data?.message || "Заявка вже існує для цієї ідеї.");
      } else {
        throw new Error(`Статус ${status}`);
      }
    } catch (err) {
      const resStatus = err?.response?.status;
      const resMsg    = err?.response?.data?.message;

      log("Axios catch", { resStatus, resMsg, err: err.message });

      if (resStatus === 409) {
        return message.info(resMsg || "Заявка вже існує для цієї ідеї.");
      }

      message.error(
        resMsg ||
          (err.message.includes("Network")
            ? "Проблеми мережі"
            : "Сталася помилка. Спробуйте пізніше.")
      );
    } finally {
      setLoading(false);
      log("handleSubmitApplication ▸ END");
    }
  };

  /* ──────────────────────────────────────── */
  /* 3. UI                                   */
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
