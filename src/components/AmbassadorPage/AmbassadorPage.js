import React, { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Card,
  Typography,
  message,
  Spin,
  Button,
  Descriptions,
} from "antd";

const { Title } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const USER_API = `${API_BASE}/userRoutes`;
const API_PROFILE = `${USER_API}/profile`;
const API_DUMP = `${USER_API}/dump`;

const AdminPage = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dumpData, setDumpData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingDump, setLoadingDump] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchAdminProfile = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не вдалося завантажити профіль адміністратора");
      const data = await res.json();
      setAdmin(data.user || data); // залежить від бекенду
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDump = async () => {
    try {
      setLoadingDump(true);
      const token = getToken();
      const res = await fetch(API_DUMP, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Не вдалося отримати базу даних");
      const data = await res.json();
      setDumpData(data);
      message.success("✅ Усі записи завантажено");
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoadingDump(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  if (loading) {
    return (
      <Layout style={{ padding: 40, textAlign: "center" }}>
        <Spin size="large" />
        <Title>Завантаження профілю...</Title>
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
      <Card style={{ marginBottom: 20 }}>
        <Title level={4}>👤 {admin?.first_name} {admin?.last_name}</Title>
        <p><b>Email:</b> {admin?.email}</p>
        <p><b>Телефон:</b> {admin?.phone}</p>
        <p><b>Роль:</b> {admin?.role || "admin"}</p>
        <Button onClick={fetchDump} type="primary" loading={loadingDump}>
          🔄 Завантажити всі записи з бази
        </Button>
      </Card>

      {dumpData && (
        <>
          <Title level={4}>📦 Дані з усіх таблиць</Title>
          {Object.entries(dumpData).map(([table, rows]) => (
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
        </>
      )}
    </Layout>
  );
};

export default AdminPage;
