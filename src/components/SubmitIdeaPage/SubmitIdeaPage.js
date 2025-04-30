import React, { useState, useEffect } from "react";
import { Layout, Form, Input, Select, Button, Alert, Typography, Spin } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const API_BASE = "https://idea-backend.onrender.com/api";

const SubmitIdeaPage = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [loadingAmbassadors, setLoadingAmbassadors] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) console.warn("⚠️ Токен не знайдено у localStorage");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getUserIdFromLocalStorage = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData?.id || null;
    } catch (err) {
      console.error("❌ Неможливо зчитати user з localStorage:", err);
      return null;
    }
  };

  const tryFetchAmbassadors = async (retries = 5, delay = 2000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(`${API_BASE}/ideaRoutes/ambassadors`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Амбасадори не масив");

        setAmbassadors(data.map((amb) => ({
          id: amb.id,
          name: `${amb.first_name} ${amb.last_name}`,
        })));
        setLoadingAmbassadors(false);
        return;
      } catch (err) {
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, delay));
        } else {
          setLoadingAmbassadors(false);
          setMessage("❌ Не вдалося завантажити амбасадорів.");
        }
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetch(`${API_BASE}/ping`, { cache: "no-store" });
      } catch (err) {
        console.warn("❌ /ping не вдалося:", err.message);
      }
      await tryFetchAmbassadors();
    };

    init();
  }, []);

  const handleSubmit = async (values) => {
    const userId = getUserIdFromLocalStorage();
    if (!userId) {
      setMessage("❌ Ви не авторизовані. Спробуйте увійти ще раз.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description,
        ambassador_id: values.ambassadorId || null,
        user_id: userId,
      };

      const res = await fetch(`${API_BASE}/ideaRoutes`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${responseText}`);

      setMessage("✅ Ідея успішно подана!");
      form.resetFields();
    } catch (err) {
      console.error("❌ Помилка подання:", err);
      setMessage("❌ Помилка подання ідеї.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "16px 0" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>Подати ідею</Title>
      </Header>

      <Content style={{ padding: "40px 20px", position: "relative" }}>
        <div style={{ position: "absolute", left: "20px", top: "40px" }}>
          <Button
            type="link"
            icon={<BulbOutlined />}
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
              label="Назва ідеї"
              name="title"
              rules={[{ required: true, message: "Будь ласка, введіть назву ідеї!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Опис ідеї"
              name="description"
              rules={[{ required: true, message: "Будь ласка, введіть опис ідеї!" }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Обрати амбасадора" name="ambassadorId">
              {loadingAmbassadors ? (
                <Spin tip="Завантаження амбасадорів..." />
              ) : (
                <Select placeholder="Оберіть амбасадора" allowClear>
                  {ambassadors.map((amb) => (
                    <Option key={amb.id} value={amb.id}>
                      {amb.name}
                    </Option>
                  ))}
                </Select>
              )}
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
                Подати ідею
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default SubmitIdeaPage;
