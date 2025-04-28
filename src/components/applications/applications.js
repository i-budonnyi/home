import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Form, Input, Button, message, Typography, Alert, Select } from "antd";
import { useNavigate } from "react-router-dom"; // 🔥 useParams видалено

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ✅ Оновлений шлях до бекенду Render
const API_APPLICATION_URL = "https://idea-backend.onrender.com/api/applicationRoutes";

const Applications = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState({
    title: "",
    content: "",
    user_id: null,
    idea_id: null,
    type: "idea", // ✅ Тип заявки
  });
  const [idea, setIdea] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    console.log("🔑 Отриманий токен з локального сховища:", token);
    return token;
  };

  useEffect(() => {
    const savedIdea = localStorage.getItem("selectedIdea");
    if (savedIdea) {
      const parsedIdea = JSON.parse(savedIdea);
      console.log("📌 Отримано ідею з локального сховища:", parsedIdea);
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
      if (!application.user_id || !application.title || !application.content || !application.type) {
        message.warning("❌ Дані заявки неповні. Переконайтеся, що всі поля заповнені.");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        message.error("❌ Необхідно авторизуватися.");
        return;
      }

      console.log("📡 Відправка заявки...");
      console.log("📤 Дані для відправки:", {
        user_id: application.user_id,
        title: application.title,
        content: application.content,
        idea_id: application.idea_id || null,
        type: application.type,
      });

      const submitResponse = await axios.post(
        API_APPLICATION_URL,
        {
          user_id: application.user_id,
          title: application.title,
          content: application.content,
          idea_id: application.idea_id || null,
          type: application.type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Відповідь сервера після відправки заявки:", submitResponse);

      if (submitResponse.status === 201 || submitResponse.status === 200) {
        message.success("✅ Заявку успішно створено!");
        navigate("/applications");
      } else {
        message.error("❌ Не вдалося створити заявку.");
      }
    } catch (err) {
      console.error("❌ Помилка створення заявки:", err);
      if (err.response) {
        console.error("🔴 Деталі помилки сервера:", err.response.data);
      }
      message.error(err.response?.data?.message || "❌ Виникла помилка.");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8", padding: "20px" }}>
      <Title level={2}>Створення заявки</Title>

      {idea && (
        <Alert
          message={`Ідея: ${idea.title}`}
          description={idea.content}
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
