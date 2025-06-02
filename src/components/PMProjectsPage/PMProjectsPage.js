import { useEffect, useState } from "react";
import axios from "axios";

const API_PM_URL = "https://idea-backend.onrender.com/api/projectManagerRoutes";
const API_JURY_URL = "https://idea-backend.onrender.com/api/juryDecisions";

const PMProjectsPage = () => {
  const [pm, setPM] = useState(null);
  const [approvedDecisions, setApprovedDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("❌ Користувач не авторизований.");
      setLoading(false);
      return;
    }

    const fetchPMAndDecisions = async () => {
      try {
        console.warn("⏳ [GET] /pm/me → Отримуємо Project Manager...");
        const pmResponse = await axios.get(`${API_PM_URL}/pm/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (pmResponse.data?.pm_id) {
          localStorage.setItem("pmId", pmResponse.data.pm_id);
          setPM(pmResponse.data);
          console.log(`✅ [PM] ${pmResponse.data.first_name} ${pmResponse.data.last_name}`);
        } else {
          throw new Error("❌ PM не знайдено. Можливо, ви не є Project Manager.");
        }

        console.warn("⏳ [GET] /jury-decisions/approved → Отримуємо схвалені рішення...");
        const decisionsResponse = await axios.get(`${API_JURY_URL}/jury-decisions/approved`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(decisionsResponse.data)) {
          setApprovedDecisions(decisionsResponse.data);
          console.log(`✅ Отримано ${decisionsResponse.data.length} рішень`);
        } else {
          throw new Error("❌ Список рішень некоректний");
        }

      } catch (err) {
        console.error("❌ [ERROR]", err.message);
        setError(err.message || "Не вдалося отримати дані.");
      } finally {
        setLoading(false);
      }
    };

    fetchPMAndDecisions();
  }, [token]);

  if (loading) return <div className="text-center text-gray-500">⏳ Завантаження...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!pm) return <div className="text-center text-gray-500">❌ PM не знайдено</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">👨‍💼 Проєктний менеджер</h1>
      <div className="border p-4 rounded-md shadow-md bg-gray-50">
        <p><strong>Ім'я:</strong> {pm.first_name} {pm.last_name}</p>
        <p><strong>Email:</strong> {pm.email}</p>
        <p><strong>Телефон:</strong> {pm.phone}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6">✅ Схвалені рішення журі</h2>
      {approvedDecisions.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {approvedDecisions.map((decision) => (
            <li key={decision.id} className="border p-4 rounded-md shadow-md bg-gray-50">
              <p><strong>Проєкт ID:</strong> {decision.project_id}</p>
              <p><strong>Рішення:</strong> {decision.decision}</p>
              <p><strong>Сума бонусу:</strong> {decision.bonus_amount} грн</p>
              <p><strong>Дата:</strong> {new Date(decision.decision_date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-gray-500">❌ Немає схвалених рішень</p>
      )}
    </div>
  );
};

export default PMProjectsPage;
