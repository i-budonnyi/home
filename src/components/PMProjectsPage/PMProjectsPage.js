import { useEffect, useState } from "react";
import axios from "axios";

const API_PM_URL = "https://backend-avtologistika.onrender.com/api/projectManagerRoutes";
const API_JURY_URL = "https://backend-avtologistika.onrender.com/api/juryDecisions";

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

    const fetchData = async () => {
      try {
        console.info("🔄 Завантаження даних Project Manager...");

        const axiosInstance = axios.create({
          baseURL: "https://backend-avtologistika.onrender.com/api",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        const pmResponse = await axiosInstance.get("/projectManagerRoutes/pm/me");
        const pmData = pmResponse.data;

        if (!pmData?.pm_id) throw new Error("❌ Користувач не є Project Manager.");
        localStorage.setItem("pmId", pmData.pm_id);
        setPM(pmData);
        console.log(`✅ PM: ${pmData.first_name} ${pmData.last_name}`);

        const decisionsResponse = await axiosInstance.get("/juryDecisions/jury-decisions/approved");
        const decisions = decisionsResponse.data;

        if (!Array.isArray(decisions)) throw new Error("❌ Список рішень має некоректний формат.");
        setApprovedDecisions(decisions);
        console.log(`✅ Отримано ${decisions.length} рішень.`);
      } catch (err) {
        console.error("❌ Помилка:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Невідома помилка при завантаженні даних.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="text-center text-gray-500">⏳ Завантаження...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!pm) return <div className="text-center text-gray-500">❌ Дані PM не знайдено</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">👨‍💼 Інформація про проєктного менеджера</h1>
      <div className="border p-4 rounded-md shadow-md bg-gray-50">
        <p><strong>Ім'я:</strong> {pm.first_name} {pm.last_name}</p>
        <p><strong>Email:</strong> {pm.email}</p>
        <p><strong>Телефон:</strong> {pm.phone}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6">✅ Схвалені рішення журі</h2>
      {approvedDecisions.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {approvedDecisions.map((decision) => (
            <li key={decision.id || decision.project_id} className="border p-4 rounded-md shadow-md bg-gray-50">
              <p><strong>Проєкт ID:</strong> {decision.project_id}</p>
              <p><strong>Рішення:</strong> {decision.decision}</p>
              <p><strong>Сума бонусу:</strong> {decision.bonus_amount ?? '—'} грн</p>
              <p><strong>Дата:</strong> {decision.decision_date ? new Date(decision.decision_date).toLocaleDateString() : '—'}</p>
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
