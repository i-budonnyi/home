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

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const PROBLEM_API_URL = `${API_BASE}/problems`;
const AMBASSADORS_API_URL = `${PROBLEM_API_URL}/ambassadors`;

const SubmitProblemPage = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAmbassadors = useCallback(async () => {
    try {
      const response = await fetch(AMBASSADORS_API_URL, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Помилка отримання амбасадорів.");
      const data = await response.json();
      setAmbassadors(
        data.map((amb) => ({
          id: amb.id,
          name: `${amb.first_name} ${amb.last_name}`,
        }))
      );
      console.log("✅ Амбасадори завантажені:", data);
    } catch (err) {
      console.error("❌ Амбасадори не завантажені:", err);
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description,
        ambassador_id: values.ambassadorId || null,
      };

      console.log("📤 Відправляємо запит:", payload);

      const response = await fetch(PROBLEM_API_URL, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📥 Відповідь від сервера:", result);

      if (!response.ok) {
        throw new Error(result.message || "Помилка створення проблеми");
      }

      setMessage("✅ Проблему успішно подано!");
      form.resetFields();
    } catch (err) {
      console.error("❌ Помилка подання проблеми:", err);
      setMessage(err.message || "❌ Не вдалося подати проблему.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, [fetchAmbassadors]);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "16px 0" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>Подати проблему</Title>
      </Header>

      <Content style={{ padding: "40px 20px", position: "relative" }}>
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

        <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "20px" }}>
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
                {ambassadors.map((amb) => (
                  <Select.Option key={amb.id} value={amb.id}>
                    {amb.name}
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
