import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Layout,
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Typography,
  Skeleton,
} from "antd";

const { Title } = Typography;

const API_SECRETARY_URL = "https://backend-avtologistika.onrender.com/api/secretaryRoutes";
const API_APPLICATION_URL = "https://backend-avtologistika.onrender.com/api/applicationRoutes";
const API_RETURN_URL = "https://backend-avtologistika.onrender.com/api/applicationReturnsRoutes";
const API_AGENDA_URL = "https://backend-avtologistika.onrender.com/api/agendaRoutes";

const JurySecretaryProfile = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agendaModalOpen, setAgendaModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formAgenda] = Form.useForm();
  const [formReturn] = Form.useForm();

  const getAuthToken = () => localStorage.getItem("token");

  const fetchSecretaryData = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_SECRETARY_URL}/secretaries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.length > 0) {
        const secretary = response.data[0];
        localStorage.setItem("secretary_id", secretary.id);
      }
    } catch (error) {
      message.error("❌ Не вдалося завантажити секретаря.");
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_APPLICATION_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setApplications(response.data);
    } catch (error) {
      message.error("❌ Не вдалося отримати заявки.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSecretaryId = () => {
    let secretaryId = localStorage.getItem("secretary_id");
    if (!secretaryId) {
      fetchSecretaryData();
      secretaryId = localStorage.getItem("secretary_id");
    }
    return secretaryId;
  };

  useEffect(() => {
    fetchSecretaryData();
    fetchApplications();
  }, [fetchSecretaryData, fetchApplications]);

  const openAgendaModal = (application) => {
    setSelectedApplication(application);
    formAgenda.resetFields();
    setAgendaModalOpen(true);
  };

  const openReturnModal = (application) => {
    setSelectedApplication(application);
    formReturn.resetFields();
    setReturnModalOpen(true);
  };

  const closeAgendaModal = () => setAgendaModalOpen(false);
  const closeReturnModal = () => setReturnModalOpen(false);

  const handleAgendaSubmit = async () => {
    try {
      const secretaryId = getSecretaryId();
      if (!secretaryId) {
        message.error("❌ ID секретаря не знайдено! Авторизуйтесь заново.");
        return;
      }

      const values = await formAgenda.validateFields();
      const formattedDate = values.meeting_date.format("YYYY-MM-DD HH:mm:ss");

      const token = getAuthToken();
      await axios.post(
        `${API_AGENDA_URL}/create`,
        {
          title: selectedApplication.title,
          description: values.description,
          meeting_date: formattedDate,
          created_by: secretaryId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("✅ Порядок денний створено!");
      closeAgendaModal();
    } catch (error) {
      message.error("❌ Не вдалося створити порядок денний.");
    }
  };

  const handleReturnSubmit = async () => {
    try {
      const values = await formReturn.validateFields();
      const token = getAuthToken();

      await axios.post(
        `${API_RETURN_URL}/return`,
        {
          application_id: selectedApplication.id,
          comment: values.comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success("✅ Заявку повернуто!");
      fetchApplications();
      closeReturnModal();
    } catch (error) {
      message.error("❌ Не вдалося повернути заявку.");
    }
  };

  return (
    <Layout style={{ padding: "20px", background: "#f4f6f8" }}>
      <Title level={3} style={{ marginTop: "20px" }}>📌 Подані ідеї</Title>

      {isLoading ? (
        <Skeleton active />
      ) : (
        <List
          dataSource={applications}
          renderItem={(application) => (
            <List.Item key={application.id}>
              <Card title={application.title} style={{ width: "100%" }}>
                <p><strong>Автор:</strong> {application.first_name} {application.last_name}</p>
                <p><strong>Опис:</strong> {application.content}</p>
                <Button type="primary" onClick={() => openReturnModal(application)}>🔄 Повернути заявку</Button>
                <Button type="default" onClick={() => openAgendaModal(application)} style={{ marginLeft: "10px" }}>
                  📅 Призначити засідання
                </Button>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal title="📅 Призначити засідання" open={agendaModalOpen} onCancel={closeAgendaModal} onOk={formAgenda.submit}>
        <Form form={formAgenda} layout="vertical" onFinish={handleAgendaSubmit}>
          <Form.Item name="meeting_date" label="Дата засідання" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item name="description" label="Опис засідання" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="🔄 Повернення заявки" open={returnModalOpen} onCancel={closeReturnModal} onOk={formReturn.submit}>
        <Form form={formReturn} layout="vertical" onFinish={handleReturnSubmit}>
          <Form.Item name="comment" label="Причина повернення" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default JurySecretaryProfile;
