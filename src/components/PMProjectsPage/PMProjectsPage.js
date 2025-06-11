// src/pages/PMProjectsPage.jsx
import React, { useEffect, useState, useCallback, Fragment } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider } from "antd";

const { Title, Text } = Typography;

/* ------------------------------------------------------------------ */
/* 🛣️  API END-POINTS
/* ------------------------------------------------------------------ */
const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_PM_ME = `${API_BASE}/projectManagerRoutes/pm/me`; // ✅ виправлено URL
const API_JURY = `${API_BASE}/approvedProjectsRoutes/jury-decisions/final`;

/* ------------------------------------------------------------------ */
/* 🔧  Axios instance – adds the token automatically & logs requests
/* ------------------------------------------------------------------ */
const buildAxios = (token) => {
  const instance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
    timeout: 25000,
  });

  instance.interceptors.request.use((cfg) => {
    console.groupCollapsed(
      `%c📤 [${cfg.method?.toUpperCase()}] ${cfg.url}`,
      "color:#00b7ff;font-weight:bold;"
    );
    console.log("Request config ⤵️", cfg);
    console.groupEnd();
    return cfg;
  });

  instance.interceptors.response.use(
    (res) => {
      console.groupCollapsed(
        `%c✅ [${res.config.url}] → ${res.status}`,
        "color:#00c853;font-weight:bold;"
      );
      console.log("Response data ⤵️", res.data);
      console.groupEnd();
      return res;
    },
    (err) => {
      const label = err.response
        ? `❌ ${err.response.status} @ ${err.config.url}`
        : "❌ NETWORK / TIMEOUT";
      console.groupCollapsed(`%c${label}`, "color:#ff1744;font-weight:bold;");
      console.error(err);
      console.groupEnd();
      return Promise.reject(err);
    }
  );

  return instance;
};

/* ------------------------------------------------------------------ */
/* 📄  React component
/* ------------------------------------------------------------------ */
const PMProjectsPage = () => {
  const [pmData, setPMData] = useState(null);
  const [juryData, setJuryData] = useState([]);
  const [loading, setLoading] = useState({ pm: true, jury: true });
  const [errors, setErrors] = useState({ pm: null, jury: null });

  const token = localStorage.getItem("token") ?? "";
  const http = useCallback(() => buildAxios(token), [token]);

  const humanErr = (err, subject) => {
    if (err.response) {
      const { status } = err.response;
      if (status === 401) return "❌ Not authorised";
      if (status === 404) return `🔍 ${subject} not found`;
      if (status >= 500 && status < 600)
        return `⚙️ Server error (${subject})`;
      return `HTTP ${status} (${subject})`;
    }
    if (err.code === "ECONNABORTED") return "⏰ Request timed-out";
    return `Network error while loading ${subject}`;
  };

  useEffect(() => {
    if (!token) {
      setErrors({
        pm: "❌ User is not authorised",
        jury: "❌ User is not authorised",
      });
      setLoading({ pm: false, jury: false });
      return;
    }

    const fetchPM = http().get(API_PM_ME);
    const fetchJury = http().get(API_JURY);

    Promise.allSettled([fetchPM, fetchJury]).then(([pmRes, juryRes]) => {
      if (pmRes.status === "fulfilled") {
        setPMData(pmRes.value.data);
      } else {
        setErrors((prev) => ({
          ...prev,
          pm: humanErr(pmRes.reason, "PM"),
        }));
      }

      if (juryRes.status === "fulfilled") {
        setJuryData(
          Array.isArray(juryRes.value.data) ? juryRes.value.data : []
        );
      } else {
        setErrors((prev) => ({
          ...prev,
          jury: humanErr(juryRes.reason, "jury decisions"),
        }));
      }

      setLoading({ pm: false, jury: false });
    });
  }, [http, token]);

  const allLoaded = !loading.pm && !loading.jury;
  const totalError = errors.pm && errors.jury;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2}>👨‍💼 Проєктний менеджер</Title>

      {totalError && (
        <Alert
          type="error"
          showIcon
          message="Critical error"
          description="Nothing could be loaded – please refresh the page."
          style={{ marginBottom: 24 }}
        />
      )}

      {loading.pm ? (
        <Spin tip="Loading PM data…" />
      ) : errors.pm ? (
        <Alert type="warning" showIcon message={errors.pm} />
      ) : (
        pmData && (
          <Card style={{ marginBottom: 32 }}>
            <p>
              <Text strong>Ім’я:</Text> {pmData.first_name} {pmData.last_name}
            </p>
            <p>
              <Text strong>Email:</Text> {pmData.email}
            </p>
            <p>
              <Text strong>Телефон:</Text> {pmData.phone}
            </p>
            <p>
              <Text strong>Роль:</Text> {pmData.role}
            </p>
          </Card>
        )
      )}

      <Divider />
      <Title level={3}>✅ Фінальні рішення журі</Title>

      {loading.jury ? (
        <Spin tip="Loading jury decisions…" />
      ) : errors.jury ? (
        <Alert type="warning" showIcon message={errors.jury} />
      ) : juryData.length ? (
        <List
          bordered
          dataSource={juryData}
          renderItem={(item) => (
            <List.Item>
              <Card style={{ width: "100%" }}>
                <Fragment>
                  <p>
                    <Text strong>Проєкт:</Text> {item.project_id}
                  </p>
                  <p>
                    <Text strong>Автор:</Text> {item.author_first_name}{" "}
                    {item.author_last_name}
                  </p>
                  <p>
                    <Text strong>Член журі:</Text> {item.jury_first_name}{" "}
                    {item.jury_last_name}
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
                </Fragment>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Alert type="info" showIcon message="Немає фінальних рішень" />
      )}

      {allLoaded && (errors.pm || errors.jury) && !totalError && (
        <Alert
          type="info"
          showIcon
          message="Partial success"
          description="Some sections could not be loaded"
          style={{ marginTop: 24 }}
        />
      )}
    </div>
  );
};

export default PMProjectsPage;
