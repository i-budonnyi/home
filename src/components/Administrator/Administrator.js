import React, { useEffect, useState } from "react";
import { Layout, Card, Typography, Spin, Avatar } from "antd";

const { Title, Text } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api/userRolesRoutes";
const API_PROFILE = `${API_BASE}/profile`;

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_PROFILE, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Помилка завантаження профілю");
      }

      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
    <Layout style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <Card style={{ textAlign: "center" }}>
        {profile.profilePicture && (
          <Avatar
            size={100}
            src={profile.profilePicture}
            style={{ marginBottom: 20 }}
          />
        )}
        <Title level={4}>
          👤 {profile.firstName} {profile.lastName}
        </Title>
        <Text><b>Роль:</b> {profile.role}</Text><br />
        <Text><b>Email:</b> {profile.email}</Text><br />
        <Text><b>Телефон:</b> {profile.phone}</Text><br />
        {profile.position && <Text><b>Посада:</b> {profile.position}</Text>}
      </Card>
    </Layout>
  );
};
export default Administrators;
