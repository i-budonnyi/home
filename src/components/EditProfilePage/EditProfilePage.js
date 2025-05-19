import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Typography, Button, Input, Form, message as antdMessage,
  ConfigProvider, theme, Card
} from "antd";
import {
  SaveOutlined, ArrowLeftOutlined, PhoneOutlined, MailOutlined,
  UserOutlined
} from "@ant-design/icons";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const EditProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (!token) return navigate("/login");
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/userRoutes/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
        form.setFieldsValue({
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,
          phone: res.data.phone,
        });
      } catch (err) {
        setError("Не вдалося завантажити профіль");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, form, token]);

  const saveChanges = async () => {
    try {
      const values = await form.validateFields();
      await axios.patch(`${API_BASE_URL}/userRoutes/${userData.id}`, {
        ...values,
        edited_once: true,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      antdMessage.success("Профіль оновлено успішно");
      navigate("/worker");
    } catch (err) {
      console.error("[SAVE_PROFILE] ❌", err);
      antdMessage.error("Помилка при оновленні профілю");
    }
  };

  if (loading) return <Title level={3} style={{ padding: 40 }}>⏳ Завантаження...</Title>;
  if (error) return <Title level={3} type="danger" style={{ padding: 40 }}>❌ {error}</Title>;

  return (
    <ConfigProvider theme={themeMode}>
      <Layout style={{ minHeight: "100vh", background: themeMode.token.colorBgLayout }}>
        <Content style={{ padding: 40 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/worker")}>
            Назад
          </Button>
          <Card
            title="Редагувати профіль"
            style={{ maxWidth: 600, marginTop: 24 }}
            bordered={false}
            headStyle={{ fontSize: 20 }}
            bodyStyle={{ paddingTop: 24 }}
          >
            <Form form={form} layout="vertical">
              <Form.Item label="Ім’я" name="first_name" rules={[{ required: true, message: "Введіть ім’я" }]}> 
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item label="Прізвище" name="last_name" rules={[{ required: true, message: "Введіть прізвище" }]}> 
                <Input prefix={<UserOutlined />} />
              </Form.Item>
              <Form.Item label="Телефон" name="phone"> 
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ type: "email", message: "Некоректна електронна адреса" }]}> 
                <Input prefix={<MailOutlined />} />
              </Form.Item>
              <Button type="primary" icon={<SaveOutlined />} onClick={saveChanges}>
                Зберегти зміни
              </Button>
            </Form>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default EditProfilePage;
