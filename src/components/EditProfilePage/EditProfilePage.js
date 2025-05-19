import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, message as antdMessage, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Title } = Typography;
const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const EditProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data;
        setInitialValues(user);
        form.setFieldsValue(user);
      } catch (err) {
        antdMessage.error("Не вдалося завантажити профіль");
        navigate("/worker");
      }
    };
    fetchProfile();
  }, [form, navigate, token]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.patch(`${API_BASE_URL}/profile`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      antdMessage.success("Дані оновлено");
      navigate("/worker");
    } catch (err) {
      antdMessage.error("Помилка при збереженні");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 600, margin: "40px auto" }}>
      <Title level={3}>Редагування профілю</Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Form.Item name="first_name" label="Ім'я" rules={[{ required: true, message: "Вкажіть ім’я" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="last_name" label="Прізвище" rules={[{ required: true, message: "Вкажіть прізвище" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: "email", message: "Некоректний email" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Телефон">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Зберегти</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProfilePage;
