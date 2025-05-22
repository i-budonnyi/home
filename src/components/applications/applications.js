import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Form, Input, Button, message, Typography, Alert, Select } from "antd";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client"; // 📡 WebSocket

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API_APPLICATION_URL = "https://backend-avtologistika.onrender.com/api/applicationRoutes";
const SOCKET_URL = "https://backend-avtologistika.onrender.com"; // 🌐 WebSocket URL

const socket = io(SOCKET_URL); // 🔌 Підключення

const Applications = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState({
    title: "",
    content: "",
    user_id: null,
    idea_id: null,
    type: "idea",
  });
  const [idea, setIdea] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token;
  };

  useEffect(() => {
    const savedIdea = localStorage.getItem("selectedIdea");
    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);
      setIdea(parsedIdea);
      setApplication((prevApp) => ({
        ...prevApp,
        title: parsedIdea.title || "Без назви",
        content: parsedIdea.description || "Без опису",
        user_id: parsedIdea.user_id,
        idea_id: parsedIdea.id,
      }));
    }
  }, []);

  const handleSubmitApplication = async () => {
    try {
      const { user_id, title, content, idea_id, type } = application;

      if (!user_id || !title || !content || !type) {
        message.warning("❌ Дані заявки неповні. Перевірте всі поля.");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        message.error("❌ Необхідно авторизуватися.");
        return;
      }

      const submitResponse = await axios.post(
        API_APPLICATION_URL,
        { user_id, title, content, idea_id, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (submitResponse.status === 201 || submitResponse.status === 200) {
        message.success("✅ Заявку успішно створено!");

        // 📡 Відправляємо WebSocket-подію
        socket.emit("application_created", {
          title,
          type,
          idea_id,
          user_id,
        });

        navigate("/applications");
      } else {
        message.error("❌ Не вдалося створити заявку.");
      }
    } catch (err) {
      console.error("❌ Помилка створення заявки:", err);
      message.error(err.response?.data?.message || "❌ Виникла помилка.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8", padding: "20px" }}>
      <Title level={2}>Створення заявки</Title>

      {idea && (
        <Alert
          message={`Ідея: ${idea.title}`}
          description={idea.description}
          type="info"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}

      <Form layout="vertical">
        <Form.Item label="Назва">
          <Input
            value={application.title || ""}
            onChange={(e) => setApplication({ ...application, title: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="Опис">
          <TextArea
            rows={4}
            value={application.content || ""}
            onChange={(e) => setApplication({ ...application, content: e.target.value })}
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
            ✅ Створити заявку
          </Button>
        </Form.Item>
      </Form>
    </Layout>
  );
};

export default Applications;
