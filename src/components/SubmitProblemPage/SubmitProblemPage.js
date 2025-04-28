import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Form,
  Input,
  Select,
  Button,
  Alert,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title } = Typography;

// ✅ НОВІ правильні шляхи
const USER_API_BASE_URL = "https://idea-backend.onrender.com/api/userRoutes";
const PROBLEM_API_BASE_URL = "https://idea-backend.onrender.com/api/problems";
const AMBASSADOR_API_BASE_URL = "https://idea-backend.onrender.com/api/problems/ambassadors";

const SubmitProblemPage = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  // 🔥 Обгортаємо запити у useCallback
  const fetchUserId = useCallback(async () => {
    try {
      const response = await fetch(`${USER_API_BASE_URL}/profile`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Помилка отримання user_id.");
      const data = await response.json();
      setUserId(data.id);
    } catch (error) {
      console.error("❌ Не вдалося отримати user_id:", error);
    }
  }, []);

  const fetchAmbassadors = useCallback(async () => {
    try {
      const response = await fetch(`${AMBASSADOR_API_BASE_URL}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Помилка отримання амбасадорів: ${response.status}`);
      const data = await response.json();
      setAmbassadors(
        data.map((ambassador) => ({
          id: ambassador.id,
          name: `${ambassador.first_name} ${ambassador.last_name}`,
        }))
      );
    } catch (error) {
      console.error("❌ Помилка отримання амбасадорів:", error);
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      if (!userId) throw new Error("Ви не авторизовані!");
      const payload = {
        title: values.title,
        description: values.description,
        ambassador_id: values.ambassadorId || null,
        user_id: userId,
      };
      const response = await fetch(`${PROBLEM_API_BASE_URL}`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Помилка подання проблеми: ${response.status}`);
      setMessage("✅ Проблема успішно подана!");
      form.resetFields();
    } catch (error) {
      console.error("❌ Помилка подання:", error);
      setMessage("❌ Помилка подання проблеми.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserId();
      await fetchAmbassadors();
    };
    fetchData();
  }, [fetchUserId, fetchAmbassadors]); // 🔥 Додали залежності

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "16px 0" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          Подати проблему
        </Title>
      </Header>

      <Content style={{ padding: "40px 20px", position: "relative" }}>
        {/* Повернутись зліва, фіксовано */}
        <div style={{ position: "absolute", left: "20px", top: "40px" }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/worker")}
            style={{
              fontWeight: "bold",
              color: "#003366",
              padding: "10px 14px",
              background: "#e6f7ff",
              borderRadius: "8px",
            }}
          >
            Повернутись на головну
          </Button>
        </div>

        {/* Центрована форма */}
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            paddingTop: "20px",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {message && (
              <Alert
                message={message}
                type={message.includes("успішно") ? "success" : "error"}
                showIcon
                style={{ marginBottom: "20px" }}
              />
            )}
            <Form.Item
              label="Назва проблеми"
              name="title"
              rules={[{ required: true, message: "Будь ласка, введіть назву проблеми!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Опис проблеми"
              name="description"
              rules={[{ required: true, message: "Будь ласка, введіть опис проблеми!" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Обрати амбасадора" name="ambassadorId">
              <Select placeholder="Оберіть амбасадора" allowClear>
                {ambassadors.map((ambassador) => (
                  <Select.Option key={ambassador.id} value={ambassador.id}>
                    {ambassador.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                style={{
                  backgroundColor: "#1677ff",
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "40px",
                  fontSize: "16px",
                }}
              >
                Подати проблему
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default SubmitProblemPage;
