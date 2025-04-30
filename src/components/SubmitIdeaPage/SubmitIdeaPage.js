import React, { useState, useEffect } from "react";
import { Layout, Form, Input, Select, Button, Alert, Typography } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title } = Typography;

// ✅ Базовий URL з /api
const API_BASE = "https://idea-backend.onrender.com/api";

const SubmitIdeaPage = () => {
  const [ambassadors, setAmbassadors] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        const res = await fetch(`${API_BASE}/ideaRoutes/ambassadors`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Амбасадори не є масивом");
        setAmbassadors(
          data.map((amb) => ({
            id: amb.id,
            name: `${amb.first_name} ${amb.last_name}`,
          }))
        );
      } catch (err) {
        console.error("❌ Не вдалося завантажити амбасадорів:", err);
        setMessage("❌ Не вдалося завантажити амбасадорів.");
      }
    };

    fetchAmbassadors();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description,
        ambassador_id: values.ambassadorId || null,
      };

      console.log("📤 Відправка ідеї:", payload);

      const res = await fetch(`${API_BASE}/ideaRoutes`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status} – ${errText}`);
      }

      setMessage("✅ Ідея успішно подана!");
      form.resetFields();
    } catch (err) {
      console.error("❌ handleSubmit:", err);
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
