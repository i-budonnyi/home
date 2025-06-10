import { useEffect, useState } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider } from "antd";

const { Title, Text } = Typography;

const API_PM = "https://backend-avtologistika.onrender.com/api/projectManagerRoutes";
const API_JURY = "https://backend-avtologistika.onrender.com/api/juryDecisions";

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("❌ Користувач не авторизований.");
        setLoading(false);
        return;
      }

      try {
        console.log("📡 Запитуємо Project Manager...");
        const pmRes = await axios.get(`${API_PM}/pm/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPM(pmRes.data);

        console.log("📡 Запитуємо фінальні рішення журі...");
        const juryRes = await axios.get(`${API_JURY}/final`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDecisions(juryRes.data);
      } catch (err) {
        console.error("❌ Помилка:", err);
        setError("Не вдалося завантажити дані. Спробуйте пізніше.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <Spin tip="Завантаження..." size="large" style={{ marginTop: 100 }} />;

  if (error) return <Alert message={error} type="error" showIcon style={{ marginTop: 100 }} />;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>👨‍💼 Проєктний менеджер</Title>
      {pm && (
        <Card style={{ marginBottom: "24px" }}>
          <p><Text strong>Ім’я:</Text> {pm.first_name} {pm.last_name}</p>
          <p><Text strong>Email:</Text> {pm.email}</p>
          <p><Text strong>Телефон:</Text> {pm.phone}</p>
          <p><Text strong>Роль:</Text> {pm.role}</p>
        </Card>
      )}

      <Divider />

      <Title level={3}>✅ Фінальні рішення журі</Title>
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
    </div>
  );
};

export default PMProjectsPage;
