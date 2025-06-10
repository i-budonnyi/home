import { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider } from "antd";

const { Title, Text } = Typography;

// Виправлені URL згідно з бекендом
const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_PM = `${API_BASE}/projectManagerRoutes`;
const API_JURY = `${API_BASE}/jury-decisions`; // Змінено з juryDecisions на jury-decisions

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  console.log("🔑 Токен з localStorage:", token); // Логування токена

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("❌ Токен не знайдено в localStorage");
        setError("❌ Користувач не авторизований.");
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Початок завантаження даних...");
        
        // Запит даних PM
        console.log("📡 Запитуємо Project Manager...", `${API_PM}/pm/me`);
        const pmRes = await axios.get(`${API_PM}/pm/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log("✅ Відповідь PM:", pmRes.status, pmRes.data);
        setPM(pmRes.data);

        // Запит фінальних рішень журі
        console.log("📡 Запитуємо фінальні рішення журі...", `${API_JURY}/final`);
        const juryRes = await axios.get(`${API_JURY}/final`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log("✅ Відповідь журі:", juryRes.status, juryRes.data);
        setDecisions(juryRes.data);

      } catch (err) {
        console.error("❌ Помилка при запиті:", {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          } : 'No response',
          config: err.config
        });

        let errorMessage = "Не вдалося завантажити дані. Спробуйте пізніше.";
        
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = "❌ Не авторизовано. Будь ласка, увійдіть знову.";
          } else if (err.response.status === 404) {
            errorMessage = "🔍 Ресурс не знайдено. Перевірте URL або зверніться до адміністратора.";
          } else if (err.response.status >= 500) {
            errorMessage = "⚙️ Помилка сервера. Спробуйте пізніше.";
          }
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log("🏁 Завершено завантаження даних");
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    console.log("🌀 Відображення індикатора завантаження");
    return <Spin tip="Завантаження..." size="large" style={{ marginTop: 100 }} />;
  }

  if (error) {
    console.log("❗ Відображення помилки:", error);
    return <Alert message={error} type="error" showIcon style={{ marginTop: 100 }} />;
  }

  console.log("📊 Відображення даних:", { pm, decisions });
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>👨‍💼 Проєктний менеджер</Title>
      {pm && (
        <Card style={{ marginBottom: "24px" }}>
          <p><Text strong>Ім'я:</Text> {pm.first_name} {pm.last_name}</p>
          <p><Text strong>Email:</Text> {pm.email}</p>
          <p><Text strong>Телефон:</Text> {pm.phone}</p>
          <p><Text strong>Роль:</Text> {pm.role}</p>
        </Card>
      )}

      <Divider />

      <Title level={3}>✅ Фінальні рішення журі</Title>
      {decisions.length > 0 ? (
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
                <p><Text strong>Дата:</Text> {new Date(item.decision_date).toLocaleDateString()}</p>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Alert message="Немає даних про фінальні рішення" type="info" showIcon />
      )}
    </div>
  );
};

export default PMProjectsPage;