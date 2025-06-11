import React, { useEffect, useState, useCallback, Fragment } from "react";
import axios from "axios";
import { Typography, Spin, Alert, List, Card, Divider, Button, Modal } from "antd";

const { Title, Text } = Typography;

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_PM_ME = `${API_BASE}/projectManagerRoutes/pm/me`;
const API_JURY = `${API_BASE}/approvedProjectsRoutes/jury-decisions/final`;
const API_USERS = `${API_BASE}/projectInvitations/users`;
const API_INVITE = `${API_BASE}/projectInvitations/invite`;

const buildAxios = (token) => {
  const instance = axios.create({
    headers: { Authorization: `Bearer ${token}` },
    timeout: 25000,
  });

  instance.interceptors.request.use((cfg) => {
    console.groupCollapsed(`%c\ud83d\udce4 [${cfg.method?.toUpperCase()}] ${cfg.url}`, "color:#00b7ff;font-weight:bold;");
    console.log("Request config \u2b07\ufe0f", cfg);
    console.groupEnd();
    return cfg;
  });

  instance.interceptors.response.use(
    (res) => {
      console.groupCollapsed(`%c\u2705 [${res.config.url}] \u2192 ${res.status}`, "color:#00c853;font-weight:bold;");
      console.log("Response data \u2b07\ufe0f", res.data);
      console.groupEnd();
      return res;
    },
    (err) => {
      const label = err.response
        ? `\u274c ${err.response.status} @ ${err.config.url}`
        : "\u274c NETWORK / TIMEOUT";
      console.groupCollapsed(`%c${label}`, "color:#ff1744;font-weight:bold;");
      console.error(err);
      console.groupEnd();
      return Promise.reject(err);
    }
  );

  return instance;
};

const PMProjectsPage = () => {
  const [pmData, setPMData] = useState(null);
  const [juryData, setJuryData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({ pm: true, jury: true, users: false });
  const [errors, setErrors] = useState({ pm: null, jury: null, users: null });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const token = localStorage.getItem("token") ?? "";
  const http = useCallback(() => buildAxios(token), [token]);

  const humanErr = (err, subject) => {
    if (err.response) {
      const { status } = err.response;
      if (status === 401) return "\u274c Not authorised";
      if (status === 404) return `\ud83d\udd0d ${subject} not found`;
      if (status >= 500 && status < 600) return `\u2699\ufe0f Server error (${subject})`;
      return `HTTP ${status} (${subject})`;
    }
    if (err.code === "ECONNABORTED") return "\u23f0 Request timed-out";
    return `Network error while loading ${subject}`;
  };

  const handleInvite = async (project_id, user_id) => {
    try {
      const res = await http().post(API_INVITE, {
        project_id,
        invited_user_id: user_id,
      });
      console.log("\u2709\ufe0f Invitation sent:", res.data);
    } catch (err) {
      console.error("\u274c Failed to invite:", err);
    }
  };

  useEffect(() => {
    if (!token) {
      setErrors({
        pm: "\u274c User is not authorised",
        jury: "\u274c User is not authorised",
        users: "\u274c User is not authorised",
      });
      setLoading({ pm: false, jury: false, users: false });
      return;
    }

    const fetchPM = http().get(API_PM_ME);
    const fetchJury = http().get(API_JURY);

    Promise.allSettled([fetchPM, fetchJury]).then(([pmRes, juryRes]) => {
      if (pmRes.status === "fulfilled") {
        setPMData(pmRes.value.data);

        if (pmRes.value.data?.role === "project_manager") {
          console.log("\ud83e\udded PM confirmed. Завантажуємо список користувачів…");
          setLoading((prev) => ({ ...prev, users: true }));

          http()
            .get(API_USERS)
            .then((res) => {
              console.log("\ud83d\udce6 Users loaded:", res.data);
              setUsers(res.data);
            })
            .catch((err) => {
              console.error("\u274c Failed to load users:", err);
              setErrors((prev) => ({ ...prev, users: humanErr(err, "users") }));
            })
            .finally(() => setLoading((prev) => ({ ...prev, users: false })));
        }
      } else {
        setErrors((prev) => ({ ...prev, pm: humanErr(pmRes.reason, "PM") }));
      }

      if (juryRes.status === "fulfilled") {
        setJuryData(Array.isArray(juryRes.value.data) ? juryRes.value.data : []);
      } else {
        setErrors((prev) => ({ ...prev, jury: humanErr(juryRes.reason, "jury decisions") }));
      }

      setLoading((prev) => ({ ...prev, pm: false, jury: false }));
    });
  }, [http, token]);

  const allLoaded = !loading.pm && !loading.jury && !loading.users;
  const totalError = errors.pm && errors.jury;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <Title level={2}>\ud83d\udc68\u200d\ud83d\udcbc Проєктний менеджер</Title>

      {totalError && (
        <Alert type="error" showIcon message="Critical error" description="Nothing could be loaded – please refresh the page." style={{ marginBottom: 24 }} />
      )}

      {loading.pm ? (
        <Spin tip="Loading PM data…" />
      ) : errors.pm ? (
        <Alert type="warning" showIcon message={errors.pm} />
      ) : (
        pmData && (
          <Card style={{ marginBottom: 32 }}>
            <p><Text strong>Ім’я:</Text> {pmData.first_name} {pmData.last_name}</p>
            <p><Text strong>Email:</Text> {pmData.email}</p>
            <p><Text strong>Телефон:</Text> {pmData.phone}</p>
            <p><Text strong>Роль:</Text> {pmData.role}</p>
          </Card>
        )
      )}

      <Divider />
      <Title level={3}>\u2705 Фінальні рішення журі</Title>

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
                  <p><Text strong>Проєкт:</Text> {item.project_id}</p>
                  <p><Text strong>Автор:</Text> {item.author_first_name} {item.author_last_name}</p>
                  <p><Text strong>Член журі:</Text> {item.jury_first_name} {item.jury_last_name}</p>
                  <p><Text strong>Рішення:</Text> {item.final_decision}</p>
                  <p><Text strong>Коментар:</Text> {item.decision_text}</p>
                  <p><Text strong>Дата:</Text> {new Date(item.decision_date).toLocaleDateString("uk-UA")}</p>
                  <Button type="primary" onClick={() => { setSelectedProjectId(item.project_id); setIsModalVisible(true); }}>
                    Запросити учасників
                  </Button>
                </Fragment>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Alert type="info" showIcon message="Немає фінальних рішень" />
      )}

      <Modal
        title="Запросити учасників"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {errors.users ? (
          <Alert type="error" message={errors.users} showIcon />
        ) : loading.users ? (
          <Spin tip="Loading users..." />
        ) : (
          <List
            bordered
            dataSource={users}
            renderItem={(user) => (
              <List.Item actions={[<Button onClick={() => handleInvite(selectedProjectId, user.id)}>Запросити</Button>]}> 
                {user.first_name} {user.last_name} — {user.email}
              </List.Item>
            )}
          />
        )}
      </Modal>

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
