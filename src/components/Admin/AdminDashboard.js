import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout, Card, Typography, Spin, Descriptions, message } from "antd";

const { Title } = Typography;
const API_BASE = "https://backend-avtologistika.onrender.com/api/administratorsRoutes";

const AdminDashboard = () => {
  const [dumpData, setDumpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTokenHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchDumpData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dump`, {
        headers: getTokenHeader(),
      });
      setDumpData(response.data);
      message.success("✅ Усі записи завантажено");
    } catch (err) {
      console.error("❌ Помилка завантаження:", err);
      setError("Не вдалося завантажити записи з бази даних.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDumpData();
  }, []);

  if (loading) {
    return (
      <Layout style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <Title>Завантаження бази...</Title>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ padding: 40, textAlign: "center" }}>
        <Title style={{ color: "red" }}>{error}</Title>
      </Layout>
    );
  }

  return (
    <Layout style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2}>📦 Усі записи з бази даних</Title>
      {Object.entries(dumpData || {}).map(([table, rows]) => (
        <Card key={table} title={`Таблиця: ${table}`} style={{ marginBottom: 20 }}>
          {rows.length === 0 ? (
            <p>Немає записів.</p>
          ) : (
            rows.map((row, index) => (
              <Descriptions
                key={index}
                size="small"
                column={1}
                bordered
                style={{ marginBottom: 12 }}
              >
                {Object.entries(row).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ))
          )}
        </Card>
      ))}
    </Layout>
  );
};

export default AdminDashboard;
