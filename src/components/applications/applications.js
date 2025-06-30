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

const API_BASE         = "https://backend-avtologistika.onrender.com";
const APPLICATIONS_URL = "/api/applicationRoutes";

const buildApiClient = () => {
  const token = localStorage.getItem("token") || "";
  return axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    withCredentials: false,
  });
};

const Applications = () => {
  const nav = useNavigate();
  const [axiosApi] = useState(() => buildApiClient());

  const [application, setApplication] = useState({
    title: "",
    content: "",
    user_id: null,
    idea_id: null,
    type: "idea",
  });

  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(false);

  const [socket] = useState(() => {
    const token = localStorage.getItem("token") || "";
    return io(API_BASE, { auth: { token } });
  });

  useEffect(() => {
    console.log("🔧 Компонент Applications ▸ Mount");

    const savedIdea = localStorage.getItem("selectedIdea");
    const savedUser = localStorage.getItem("user");

    const currentUserId =
      savedUser && JSON.parse(savedUser)?.id
        ? Number(JSON.parse(savedUser).id)
        : null;

    console.log("🧠 useEffect + статика");
    console.log("🟡 user_id =", currentUserId);

    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);
      console.log("✅ selectedIdea знайдено:", parsedIdea);

      setIdea(parsedIdea);
      setApplication((prev) => ({
        ...prev,
        title: parsedIdea.title || "Без назви",
        content: parsedIdea.description || "Без опису",
        user_id: currentUserId,
        idea_id: Number(parsedIdea.id),
      }));
    } else {
      setApplication((prev) => ({ ...prev, user_id: currentUserId }));
    }

    socket.on("connect", () => {
      console.info("🔌 WebSocket connected:", socket.id);
    });
    socket.on("connect_error", (err) =>
      console.error("❌ WebSocket connect error:", err.message)
    );

    return () => {
      socket.off();
      socket.disconnect();
      console.log("📴 WebSocket ▸ disconnected");
    };
  }, [socket]);

  const handleSubmitApplication = async () => {
    console.log("⏩ handleSubmitApplication ▸ старт");

    const { user_id, title, content, idea_id, type } = application;

    if (!user_id || !title.trim() || !content.trim()) {
      return message.warning("⚠️ Заповніть усі обов’язкові поля.");
    }

    const payload = {
      user_id,
      title: title.trim(),
      content: content.trim(),
      type,
      idea_id: type === "idea" ? Number(idea_id) : null,
    };

    console.log("📦 payload сформовано", payload);

    setLoading(true);

    try {
      console.group("📤 POST →", APPLICATIONS_URL);
      const response = await axiosApi.post(APPLICATIONS_URL, payload);

      console.log("✅ Відповідь з бекенду:", response);
      console.log("🟢 status =", response.status);

      if (response.status === 200 || response.status === 201) {
        message.success("✅ Заявку створено успішно!");
        console.log("📡 Надсилаємо WebSocket:");
        socket.emit("application_created", {
          ...payload,
          timestamp: Date.now(),
        });

        console.log("🚦 redirect → /applications");
        nav("/applications");
      } else {
        throw new Error(`❗️ Unexpected status: ${response.status}`);
      }
    } catch (err) {
      console.log("❌ Axios error = ", err);

      const resStatus = err?.response?.status;
      const resData = err?.response?.data;

      console.error("📛 status:", resStatus);
      console.error("📛 data  :", resData);

      if (resStatus === 409) {
        return message.info(
          resData?.message || "Заявка вже існує для цієї ідеї."
        );
      }

      message.error(
        resData?.message ||
          (err.message.includes("Network")
            ? "Проблеми мережі"
            : "Сталася помилка. Спробуйте пізніше.")
      );
    } finally {
      setLoading(false);
      console.groupEnd();
      console.log("✅ handleSubmitApplication ▸ завершено");
    }
  };

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
            onChange={(val) =>
              setApplication({ ...application, type: val })
            }
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
