import React, { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider } from "antd";

const { Title, Text } = Typography;

// 👇 Сервер сам заходить у routes/, тому назви шляху прямо як у router.get("/...")
const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_PM = `${API_BASE}/pm/me`;
const API_JURY = `${API_BASE}/jury-decisions/final`;

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState({ pm: true, decisions: true });
  const [errors, setErrors] = useState({ pm: null, decisions: null });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setErrors({
        pm: "❌ Користувач не авторизований",
        decisions: "❌ Користувач не авторизований",
      });
      setLoading({ pm: false, decisions: false });
      return;
    }

    const fetchPM = async () => {
      try {
        const res = await axios.get(API_PM, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPM(res.data);
      } catch (err) {
        console.error("❌ PM Error:", err);
        setErrors((prev) => ({
          ...prev,
          pm: getErrorMessage(err, "PM"),
        }));
      } finally {
        setLoading((prev) => ({ ...prev, pm: false }));
      }
    };

    const fetchJury = async () => {
      try {
        const res = await axios.get(API_JURY, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDecisions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Jury Error:", err);
        setErrors((prev) => ({
          ...prev,
          decisions: getErrorMessage(err, "Рішення журі"),
        }));
      } finally {
        setLoading((prev) => ({ ...prev, decisions: false }));
      }
    };

    fetchPM();
    fetchJury();
  }, [token]);

  const getErrorMessage = (error, label) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) return "❌ Не авторизовано";
      if (status === 404) return `🔍 ${label} не знайдено`;
      if (status >= 500) return `⚙️ Помилка сервера (${label})`;
      return `Помилка ${status} (${label})`;
    }
    return `Не вдалося завантажити ${label}`;
  };

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
          ) : (
            pm && (
              <Card style={{ marginBottom: 24 }}>
                <p>
                  <Text strong>Ім'я:</Text> {pm.first_name} {pm.last_name}
                </p>
                <p>
                  <Text strong>Email:</Text> {pm.email}
                </p>
                <p>
                  <Text strong>Телефон:</Text> {pm.phone}
                </p>
                <p>
                  <Text strong>Роль:</Text> {pm.role}
                </p>
              </Card>
            )
          )}

          <Divider />

          <Title level={3}>✅ Фінальні рішення журі</Title>

          {loading.decisions ? (
            <Spin tip="Завантаження рішень..." />
          ) : errors.decisions ? (
            <Alert message={errors.decisions} type="warning" showIcon />
          ) : decisions.length > 0 ? (
            <List
              dataSource={decisions}
              bordered
              renderItem={(item) => (
                <List.Item>
                  <Card style={{ width: "100%" }}>
                    <p>
                      <Text strong>Проєкт:</Text> {item.project_id}
                    </p>
                    <p>
                      <Text strong>Автор:</Text> {item.author_first_name} {item.author_last_name}
                    </p>
                    <p>
                      <Text strong>Член журі:</Text> {item.jury_first_name} {item.jury_last_name}
                    </p>
                    <p>
                      <Text strong>Рішення:</Text> {item.final_decision}
                    </p>
                    <p>
                      <Text strong>Коментар:</Text> {item.decision_text}
                    </p>
                    <p>
                      <Text strong>Дата:</Text>{" "}
                      {new Date(item.decision_date).toLocaleDateString("uk-UA")}
                    </p>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Alert message="Немає фінальних рішень" type="info" showIcon />
          )}

          {allLoaded && (errors.pm || errors.decisions) && (
            <Alert
              message="Частковий успіх"
              description="Деякі дані не вдалося отримати"
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
