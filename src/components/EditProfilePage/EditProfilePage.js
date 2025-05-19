import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Typography, Button, Input, Form, message as antdMessage,
  ConfigProvider, theme, Card
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const EditProfilePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isDarkMode = localStorage.getItem("theme") === "dark";

  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/userRoutes/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        form.setFieldsValue({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone,
        });
      } catch (err) {
        console.error("[FETCH_PROFILE_ERROR]", err);
        antdMessage.error("Не вдалося завантажити профіль.");
      }
    };

    fetchProfile();
  }, [form, navigate, token]);

  const handleSave = async (values) => {
    try {
      await axios.patch(`${API_BASE_URL}/self/profile`, {
        ...values,
        edited_once: true,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      antdMessage.success("Профіль оновлено.");
      navigate("/worker");
    } catch (err) {
      console.error("[UPDATE_PROFILE_ERROR]", err);
      antdMessage.error("Помилка збереження профілю.");
    }
  };

  const themeMode = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1E63F2",
      fontFamily: "Roboto, sans-serif",
      borderRadius: 20,
      colorTextBase: isDarkMode ? "#E1E6EB" : "#1C1C1C",
      colorBgContainer: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      colorBgLayout: isDarkMode ? "#121212" : "#F0F2F5",
      colorBorder: isDarkMode ? "#2C313A" : "#DDE1E6",
    },
  };

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh" }}>
        <Content style={{ padding: "40px 24px", background: themeMode.token.colorBgLayout }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/worker")}
            style={{ marginBottom: 24 }}
          >
            Назад до профілю
          </Button>

          <Card style={{ maxWidth: 720, margin: "0 auto", borderRadius: 20, padding: 28 }}>
            <Title level={3}>Редагування профілю</Title>
            <Form layout="vertical" form={form} onFinish={handleSave}>
              <Form.Item name="first_name" label="Ім’я">
                <Input placeholder="Ваше ім’я" />
              </Form.Item>
              <Form.Item name="last_name" label="Прізвище">
                <Input placeholder="Ваше прізвище" />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input placeholder="Email" type="email" />
              </Form.Item>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="Номер телефону" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Зберегти
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default EditProfilePage;
