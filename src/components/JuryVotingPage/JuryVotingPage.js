import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Card, Typography, Spin, Alert, Button, Select, Input, DatePicker, message } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

// ✅ НОВІ правильні шляхи до API
const API_BASE_URL = "https://idea-backend.onrender.com/api";
const API_JURY_MEMBER = `${API_BASE_URL}/juryPanelRoutes/me`;
const API_AGENDA_ALL = `${API_BASE_URL}/agendaRoutes/`;
const API_VOTE = `${API_BASE_URL}/juryVoting/vote`;

const JuryMemberProfile = () => {
  const [juryMember, setJuryMember] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [sortBy, setSortBy] = useState("date");

  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchJuryMember();
    fetchAgenda();
  }, [sortBy]);

  const fetchJuryMember = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("❌ Токен не знайдено.");
      const response = await axios.get(API_JURY_MEMBER, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setJuryMember(response.data);
      } else {
        throw new Error(`❌ Сервер повернув статус: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgenda = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("❌ Токен не знайдено.");
      const response = await axios.get(API_AGENDA_ALL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { filterBy: sortBy },
      });

      if (response.status === 200) {
        setAgenda(response.data);
      } else {
        throw new Error(`❌ Сервер повернув статус: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVote = async (agendaId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("❌ Токен не знайдено.");
      const decision = decisions[agendaId] || {};
      if (!decision.type || !decision.comment) {
        message.warning("⚠️ Оберіть рішення та додайте коментар перед голосуванням!");
        return;
      }

      if (decision.type === "review_allowed" && !decision.reviewDate) {
        message.warning("⚠️ Виберіть дату перегляду!");
        return;
      }

      if (decision.type === "approved" && (!decision.bonus || decision.bonus <= 0)) {
        message.warning("⚠️ Вкажіть бонус при схваленні!");
        return;
      }

      const payload = {
        agenda_id: agendaId,
        decision_type: decision.type,
        comment: decision.comment,
        review_date: decision.type === "review_allowed" ? decision.reviewDate : null,
        bonus_amount: decision.type === "approved" ? Number(decision.bonus) : 0,
      };

      const response = await axios.post(API_VOTE, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        message.success("✅ Голос успішно збережено!");
        fetchAgenda();
      } else {
        throw new Error(`❌ Сервер повернув статус: ${response.status}`);
      }
    } catch (error) {
      message.error("❌ ПОМИЛКА при голосуванні: " + error.message);
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  return (
    <Layout style={{ padding: "20px", background: "#f4f6f8" }}>
      <Title level={3}>👤 Профіль журі</Title>

      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={`❌ ${error}`} type="error" showIcon />
      ) : juryMember ? (
        <Card>
          <Text strong>👤 {juryMember.first_name} {juryMember.last_name}</Text>
          <br />
          <Text>📧 Email: {juryMember.email}</Text>
          <br />
          <Text>📞 Телефон: {juryMember.phone || "Не вказано"}</Text>
          <br />
          <Text type="secondary">🛠 Роль: {juryMember.role}</Text>

          <Title level={4} style={{ marginTop: 20 }}>📅 Порядок денний</Title>
          <Select
            defaultValue={sortBy}
            style={{ width: 200, marginBottom: 20 }}
            onChange={handleSortChange}
          >
            <Option value="date">За датою</Option>
            <Option value="approved">За прийнятим рішенням</Option>
            <Option value="pending">За очікуваними рішеннями</Option>
          </Select>

          {agenda.length > 0 ? (
            agenda.map((item) => (
              <Card key={item.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ddd" }}>
                <Text strong>📝 Назва: {item.title}</Text>
                <br />
                <Text>📜 Текст заявки: {item.description || "Немає опису"}</Text>
                <br />
                <Text>📆 Дата голосування: {item.meeting_date ? new Date(item.meeting_date).toLocaleString() : "Не вказано"}</Text>
                <br />
                <Text>📌 Статус рішення: {item.decision_type ? item.decision_type.toUpperCase() : "Очікує рішення"}</Text>

                {!item.decision_type ? (
                  <>
                    <Select
                      style={{ width: "100%", marginTop: 10 }}
                      placeholder="Оберіть рішення"
                      onChange={(value) =>
                        setDecisions({ ...decisions, [item.id]: { ...decisions[item.id], type: value } })
                      }
                    >
                      <Option value="rejected">Відхилено</Option>
                      <Option value="revision">Відхилено на доопрацювання</Option>
                      <Option value="review_allowed">Відхилено з правом перегляду</Option>
                      <Option value="approved">Схвалено (з премією)</Option>
                    </Select>

                    {decisions[item.id]?.type === "review_allowed" && (
                      <DatePicker
                        style={{ marginTop: 10, width: "100%" }}
                        placeholder="Оберіть дату перегляду"
                        onChange={(date, dateString) =>
                          setDecisions({ ...decisions, [item.id]: { ...decisions[item.id], reviewDate: dateString } })
                        }
                      />
                    )}

                    {decisions[item.id]?.type === "approved" && (
                      <Input
                        style={{ marginTop: 10 }}
                        type="number"
                        placeholder="Бонус (₴)"
                        onChange={(e) =>
                          setDecisions({ ...decisions, [item.id]: { ...decisions[item.id], bonus: e.target.value } })
                        }
                      />
                    )}

                    <Input.TextArea
                      style={{ marginTop: 10 }}
                      placeholder="Коментар (обов'язково)"
                      onChange={(e) =>
                        setDecisions({ ...decisions, [item.id]: { ...decisions[item.id], comment: e.target.value } })
                      }
                    />

                    <Button type="primary" style={{ marginTop: 10 }} onClick={() => handleVote(item.id)}>
                      Підтвердити голос
                    </Button>
                  </>
                ) : (
                  <Button type="default" disabled>
                    Голосування закрито
                  </Button>
                )}
              </Card>
            ))
          ) : (
            <Alert message="ℹ️ Немає записів у порядку денному." type="info" showIcon />
          )}
        </Card>
      ) : null}
    </Layout>
  );
};

export default JuryMemberProfile;
