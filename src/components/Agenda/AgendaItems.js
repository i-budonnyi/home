import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSocketEvent } from "./useSocket"; // ⬅️ додаємо

const API_BASE_URL = "https://backend-avtologistika.onrender.com/api";

const AgendaItems = ({ agendaId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/agenda/${agendaId}/items`);
      setItems(response.data || []);
    } catch (err) {
      console.error("❌ Error fetching agenda items:", err.message);
      setError("Не вдалося завантажити пункти порядку денного.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (itemId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/agenda/items/${itemId}`, { status });
      alert("✅ Статус успішно оновлено.");
      // ❌ тут уже не треба вручну оновлювати — це зробить WebSocket
    } catch (err) {
      console.error("❌ Error updating status:", err.message);
      alert("❌ Помилка оновлення статусу.");
    }
  };

  useEffect(() => {
    if (agendaId) {
      fetchItems();
    }
  }, [agendaId]);

  // 📡 Слухаємо WebSocket подію, і при отриманні — оновлюємо список
  useSocketEvent("agenda_items_updated", (payload) => {
    if (payload.agenda_id === agendaId) {
      fetchItems();
    }
  });

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <ul style={{ padding: 0, listStyle: "none" }}>
      {items.map((item) => (
        <li
          key={item.id}
          style={{
            background: "#f9f9f9",
            padding: "12px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
        >
          <strong>{item.description}</strong> <br />
          Статус: <span style={{ fontWeight: "bold" }}>{item.status}</span> <br />
          <button
            onClick={() => updateStatus(item.id, "reviewed")}
            style={{
              marginTop: "8px",
              padding: "6px 12px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ✅ Позначити як переглянуте
          </button>
        </li>
      ))}
    </ul>
  );
};

export default AgendaItems;
