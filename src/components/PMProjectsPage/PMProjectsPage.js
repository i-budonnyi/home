import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider } from "antd";

const { Title, Text } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_PM = `${API_BASE}/projectManagerRoutes`;
const API_JURY = `${API_BASE}/jury-decisions`;

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState({
    pm: true,
    decisions: true
  });
  const [errors, setErrors] = useState({
    pm: null,
    decisions: null
  });

  const token = localStorage.getItem("token");
  console.log("🔑 Token from localStorage:", token);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("❌ Token is missing");
        setErrors({
          pm: "❌ Користувач не авторизований",
          decisions: "❌ Користувач не авторизований"
        });
        setLoading({ pm: false, decisions: false });
        return;
      }

      // Завантаження даних PM
      try {
        console.log("📡 Fetch PM →", `${API_PM}/pm/me`);
        const pmRes = await axios.get(`${API_PM}/pm/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("✅ PM response:", pmRes.status, pmRes.data);
        setPM(pmRes.data);
      } catch (err) {
        console.error("❌ PM fetch error:", err);
        setErrors(prev => ({
          ...prev,
          pm: getErrorMessage(err, "PM")
        }));
      } finally {
        setLoading(prev => ({ ...prev, pm: false }));
      }

      // Завантаження рішень журі (паралельно)
      try {
        console.log("📡 Fetch Jury Decisions →", `${API_JURY}/final`);
        const juryRes = await axios.get(`${API_JURY}/final`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("✅ Jury response:", juryRes.status, juryRes.data);
        setDecisions(Array.isArray(juryRes.data) ? juryRes.data : []);
      } catch (err) {
        console.error("❌ Jury fetch error:", err);
        setErrors(prev => ({
          ...prev,
          decisions: getErrorMessage(err, "Jury Decisions")
        }));
      } finally {
        setLoading(prev => ({ ...prev, decisions: false }));
      }
    };

    fetchData();
  }, [token]);

  const getErrorMessage = (error, context) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) return "❌ Не авторизовано";
      if (status === 404) return `🔍 ${context} не знайдено`;
      if (status >= 500) return `⚙️ Помилка сервера для ${context}`;
      return `Помилка ${status} для ${context}`;
    }
    return `Не вдалося завантажити ${context}`;
  };

  // Перевірка, чи всі запити завершені
  const allLoaded = !loading.pm && !loading.decisions;
  const hasCriticalError = errors.pm && errors.decisions;

  return (
    <div style={{ padding: 20 }}>
      {hasCriticalError ? (
        <Alert 
          message="Критична помилка" 
          description="Не вдалося завантажити жодні дані. Спробуйте оновити сторінку."
          type="error" 
          showIcon 
          style={{ marginTop: 100 }} 
        />
      ) : (
        <>
          <Title level={2}>👨‍💼 Проєктний менеджер</Title>
          
          {loading.pm ? (
            <Spin tip="Завантаження даних PM..." />
          ) : errors.pm ? (
            <Alert message={errors.pm} type="warning" showIcon />
          ) : pm ? (
            <Card style={{ marginBottom: 24 }}>
              <p><Text strong>Ім'я:</Text> {pm.first_name} {pm.last_name}</p>
              <p><Text strong>Email:</Text> {pm.email}</p>
              <p><Text strong>Телефон:</Text> {pm.phone}</p>
              <p><Text strong>Роль:</Text> {pm.role}</p>
            </Card>
          ) : null}

          <Divider />

          <Title level={3}>✅ Фінальні рішення журі</Title>
          
          {loading.decisions ? (
            <Spin tip="Завантаження рішень журі..." />
          ) : errors.decisions ? (
            <Alert message={errors.decisions} type="warning" showIcon />
          ) : decisions.length > 0 ? (
            <List
              dataSource={decisions}
              bordered
              renderItem={(item) => (
                <List.Item>
                  <Card style={{ width: "100%" }}>
                    <p><Text strong>Проєкт:</Text> {item.project_id}</p>
                    <p><Text strong>Автор:</Text> {item.author_first_name} {item.author_last_name}</p>
                    <p><Text strong>Член журі:</Text> {item.jury_first_name} {item.jury_last_name}</p>
                    <p><Text strong>Рішення:</Text> {item.final_decision}</p>
                    <p><Text strong>Коментар:</Text> {item.decision_text}</p>
                    <p><Text strong>Дата:</Text> {new Date(item.decision_date).toLocaleDateString("uk-UA")}</p>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Alert message="Немає даних про фінальні рішення" type="info" showIcon />
          )}

          {allLoaded && (errors.pm || errors.decisions) && (
            <Alert
              message="Частковий успіх"
              description="Деякі дані не завантажилися, але інші доступні"
              type="info"
              showIcon
              style={{ marginTop: 20 }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PMProjectsPage;