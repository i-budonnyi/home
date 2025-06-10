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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  console.log("🔑 Token from localStorage:", token);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("❌ Token is missing");
        setError("❌ Користувач не авторизований. Будь ласка, увійдіть.");
        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Starting data fetch...");

        // 1) Отримуємо дані Project Manager
        console.log("📡 Fetch PM →", `${API_PM}/pm/me`);
        const pmRes = await axios.get(`${API_PM}/pm/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("✅ PM response:", pmRes.status, pmRes.data);
        if (pmRes.status === 200) {
          setPM(pmRes.data);
        } else {
          throw new Error(`Unexpected status ${pmRes.status} for PM`);
        }

        // 2) Отримуємо фінальні рішення журі
        console.log("📡 Fetch Jury Decisions →", `${API_JURY}/final`);
        const juryRes = await axios.get(`${API_JURY}/final`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("✅ Jury response:", juryRes.status, juryRes.data);
        if (juryRes.status === 200) {
          setDecisions(Array.isArray(juryRes.data) ? juryRes.data : []);
        } else {
          throw new Error(`Unexpected status ${juryRes.status} for Jury`);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);

        if (err.response) {
          const { status } = err.response;
          if (status === 401) {
            setError("❌ Не авторизовано. Будь ласка, увійдіть заново.");
          } else if (status === 404) {
            setError("🔍 Ресурс не знайдено. Перевірте URL або зверніться до адміністратора.");
          } else if (status >= 500) {
            setError("⚙️ Помилка сервера. Спробуйте пізніше.");
          } else {
            setError(`Помилка ${status}: ${err.response.data?.message || err.message}`);
          }
        } else {
          setError("Не вдалося встановити з’єднання з сервером.");
        }
      } finally {
        setLoading(false);
        console.log("🏁 Data fetch completed");
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <Spin tip="Завантаження..." size="large" style={{ marginTop: 100 }} />;
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>👨‍💼 Проєктний менеджер</Title>
      {pm ? (
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
      ) : (
        <Alert message="Не вдалося завантажити дані PM" type="warning" showIcon />
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
        <Alert message="Немає даних про фінальні рішення" type="info" showIcon />
      )}
    </div>
  );
};

export default PMProjectsPage;
