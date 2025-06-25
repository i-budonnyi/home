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
import { io } from "socket.io-client"; // v4

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/* ------------------------------------------------------------------ */
/* 🔗 1.  Базовий URL бек-енду – dev | prod -------------------------- */
const PROD_API = "https://backend-avtologistika.onrender.com";
const DEV_API = "http://localhost:5000";

const API_BASE = window.location.hostname === "localhost" ? DEV_API : PROD_API;

/* REST роут */
const API_APPLICATIONS_URL = `${API_BASE}/api/applications`;

/* ------------------------------------------------------------------ */
/* 2.  Axios-інстанс з токеном у header ----------------------------- */
const getAxios = () => {
  const token = localStorage.getItem("token") || "";
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ------------------------------------------------------------------ */
const Applications = () => {
  const navigate = useNavigate();
  const [axiosApi] = useState(() => getAxios());

  /* форма заявки ---------------------------------------------------- */
  const [application, setApplication] = useState({
    title: "",
    content: "",
    user_id: null,
    idea_id: null,
    type: "idea",
  });

  /* обрана ідея (передана з попередньої сторінки) ------------------- */
  const [idea, setIdea] = useState(null);

  /* 3. WebSocket: ініціалізуємо один раз після завантаження токена -- */
  const [socket] = useState(() => {
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } }); // передаємо JWT
  });

  /* --------------------------------------------------------- useEffect */
  useEffect(() => {
    /* читаємо selectedIdea з localStorage */
    const savedIdea = localStorage.getItem("selectedIdea");
    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);
      setIdea(parsedIdea);
      setApplication((prev) => ({
        ...prev,
        title: parsedIdea.title || "Без назви",
        content: parsedIdea.description || "Без опису",
        user_id: parsedIdea.user_id,
        idea_id: parsedIdea.id,
      }));
    }

    /* debug (WebSocket) */
    socket.on("connect", () =>
      console.info("🔌 WebSocket connected, id:", socket.id)
    );
    socket.on("connect_error", (err) =>
      console.error("❌ WS connect error:", err.message)
    );

    return () => {
      socket.off(); // clean listeners
      socket.disconnect();
    };
  }, [socket]);

  /* --------------------------------------------------- handle submit */
  const handleSubmitApplication = async () => {
    const { user_id, title, content, idea_id, type } = application;

    if (!user_id || !title.trim() || !content.trim()) {
      return message.warning("⚠️ Заповніть усі обов’язкові поля.");
    }

    /* готуємо payload */
    const payload = {
      user_id,
      title: title.trim(),
      content: content.trim(),
      type,
    };
    if (type === "idea" && idea_id) payload.idea_id = idea_id;

    try {
      console.info("➡️  POST", API_APPLICATIONS_URL, payload);
      const { status, data } = await axiosApi.post(
        "/api/applications", // відносно baseURL
        payload
      );

      console.info("⬅️  response", status, data);

      if (status === 201 || status === 200) {
        message.success("✅ Заявку створено!");

        /* 🔊 WebSocket повідомлення */
        socket.emit("application_created", {
          ...payload,
          timestamp: new Date(),
        });

        navigate("/applications");
      } else {
        throw new Error("unexpected status");
      }
    } catch (err) {
      console.error("❌ Створення заявки:", err);
      message.error(
        err.response?.data?.message || "❌ Внутрішня помилка сервера."
      );
    }
  };

  /* ------------------------------------------------------------- UI */
  return (
    <Layout
      style={{ minHeight: "100vh", background: "#f4f6f8", padding: 20 }}
    >
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
            onChange={(value) => setApplication({ ...application, type: value })}
          >
            <Option value="idea">Ідея</Option>
            <Option value="problem">Проблема</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSubmitApplication}>
            Створити заявку
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Applications;
