import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spin, Typography, List, Card } from "antd";

const { Title, Text } = Typography;

const API_PM_URL = "https://idea-backend.onrender.com/api/projectManagerRoutes";
const API_JURY_URL = "https://idea-backend.onrender.com/api/juryDecisions";

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [approvedDecisions, setApprovedDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("❌ Користувач не авторизований.");
      setLoading(false);
      return;
    }

    const fetchPMAndDecisions = async () => {
      try {
        console.log("⏳ Отримуємо дані Project Manager...");
        const pmResponse = await axios.get(`${API_PM_URL}/pm/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Project Manager:", pmResponse.data);
        setPM(pmResponse.data);

        const decisionsResponse = await axios.get(`${API_JURY_URL}/approved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Approved Decisions:", decisionsResponse.data);
        setApprovedDecisions(decisionsResponse.data);
      } catch (err) {
        console.error("❌ Помилка при завантаженні:", err);
        setError("Сталася помилка при завантаженні даних.");
      } finally {
        setLoading(false);
      }
    };

    fetchPMAndDecisions();
  }, [token]);

  if (loading) {
    return <Spin tip="Завантаження..." fullscreen />;
  }

  if (error) {
    return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>📋 Проєкти Project Manager</Title>
      {pm && (
        <Card style={{ marginBottom: 24 }}>
          <Text strong>Ім'я:</Text> {pm.first_name} {pm.last_name} <br />
          <Text strong>Email:</Text> {pm.email}
        </Card>
      )}

      <Title level={4}>✅ Підтверджені рішення журі</Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={approvedDecisions}
        renderItem={(item) => (
          <List.Item>
            <Card title={item.idea_title}>
              <p><strong>Опис:</strong> {item.description}</p>
              <p><strong>Дата:</strong> {new Date(item.created_at).toLocaleString()}</p>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PMProjectsPage;
