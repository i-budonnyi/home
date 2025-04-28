import { useEffect, useState } from "react";
import axios from "axios";

// ✅ НОВІ правильні шляхи до API
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
            setError("❌ Користувач не автентифікований.");
            setLoading(false);
            return;
        }

        const fetchPMAndDecisions = async () => {
            try {
                console.warn("⚠️ [GET] /pm/me → Отримуємо поточного Project Manager...");
                const pmResponse = await axios.get(`${API_PM_URL}/pm/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (pmResponse.status === 200 && pmResponse.data.pm_id) {
                    localStorage.setItem("pmId", pmResponse.data.pm_id);
                    setPM(pmResponse.data);
                    console.log(`✅ [SUCCESS] /pm/me → Отримано PM: ${pmResponse.data.first_name} ${pmResponse.data.last_name}`);
                } else {
                    throw new Error("❌ Сервер не повернув PM");
                }

                console.warn("⚠️ [GET] /jury-decisions/approved → Отримуємо схвалені рішення журі...");
                const decisionsResponse = await axios.get(`${API_JURY_URL}/jury-decisions/approved`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (decisionsResponse.status === 200) {
                    setApprovedDecisions(decisionsResponse.data);
                    console.log(`✅ [SUCCESS] /jury-decisions/approved → Отримано ${decisionsResponse.data.length} схвалених рішень`);
                } else {
                    throw new Error("❌ Сервер не повернув список схвалених рішень");
                }
            } catch (err) {
                console.error("❌ [ERROR] Запит провалено:", err);
                setError("Не вдалося отримати дані.");
            } finally {
                setLoading(false);
            }
        };

        fetchPMAndDecisions();
    }, [token]);

    if (loading) return <div className="text-center text-gray-500">⏳ Завантаження...</div>;
    if (error) return <div className="text-center text-red-500">❌ {error}</div>;
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
                    {approvedDecisions.map(decision => (
                        <li key={decision.id} className="border p-4 rounded-md shadow-md bg-gray-50">
                            <p><strong>Проєкт ID:</strong> {decision.project_id}</p>
                            <p><strong>Рішення:</strong> {decision.decision}</p>
                            <p><strong>Сума бонусу:</strong> {decision.bonus_amount} грн</p>
                            <p><strong>Дата прийняття:</strong> {new Date(decision.decision_date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-4 text-gray-500">❌ Немає схвалених рішень журі</p>
            )}
        </div>
    );
};

export default PMProjectsPage;
