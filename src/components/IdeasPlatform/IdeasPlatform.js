import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  List,
  Card,
  Typography,
  Skeleton,
  Alert,
  Button,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const API_PROBLEM_URL = "https://backend-avtologistika.onrender.com/api/problems";

const IdeasSubmissionPage = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem("token");

  const fetchUserProblems = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("❌ Необхідна авторизація. Будь ласка, увійдіть у систему.");
      }

      const response = await axios.get(`${API_PROBLEM_URL}/user-problems`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        setProblems(response.data);
      } else {
        throw new Error(response.data.message || "Не вдалося отримати проблеми.");
      }
    } catch (err) {
      console.error("❌ ПОМИЛКА у fetchUserProblems:", err.response?.data || err.message);
      setError(err.response?.data?.message || "❌ Не вдалося завантажити ваші проблеми.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProblems();
  }, [fetchUserProblems]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f8" }}>
      <Header style={{ background: "#003366", textAlign: "center", padding: "15px" }}>
        <Title style={{ color: "white", fontSize: "24px", margin: 0 }}>
          Мої подані проблеми
        </Title>
      </Header>

      <Content style={{ padding: "20px", maxWidth: "900px", margin: "auto" }}>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
        )}

        {isLoading ? (
          <Skeleton active />
        ) : (
          <List
            grid={{ gutter: 20, column: 1 }}
            dataSource={problems}
            renderItem={(problem) => (
              <List.Item>
                <Card
                  hoverable
                  title={
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {problem.title || "Без назви"}
                    </Title>
                  }
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    background: "#ffffff",
                  }}
                >
                  <Text>{problem.description || "Без опису"}</Text>
                  <br />
                  <Tag
                    color={getStatusColor(problem.status)}
                    style={{ marginTop: "10px", fontSize: "14px" }}
                  >
                    {problem.status ? problem.status.toUpperCase() : "НЕ ВКАЗАНО"}
                  </Tag>
                  <br />
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Автор:{" "}
                    {problem.author_first_name && problem.author_last_name
                      ? `${problem.author_first_name} ${problem.author_last_name}`
                      : "Невідомий"}
                  </Text>
                  <br />
                  <Button
                    type="primary"
                    onClick={() => navigate(`/problem/${problem.id}`)}
                    style={{ marginTop: "10px" }}
                  >
                    Детальніше
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Content>
    </Layout>
  );
};

export default IdeasSubmissionPage;
