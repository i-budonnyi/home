import React, { useState, useEffect } from "react";

const API_URL = "https://backend-avtologistika.onrender.com/api/administrators";

const Administrators = () => {
  const [administrators, setAdministrators] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
  });

  const fetchAdministrators = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setAdministrators(data || []);
    } catch (error) {
      console.error("❌ Error fetching administrators:", error);
    }
  };

  const createAdministrator = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("❌ Сталася помилка при створенні.");
      await response.json();
      alert("✅ Адміністратора успішно додано!");
      setFormData({ first_name: "", last_name: "", phone: "", email: "", password: "" });
      fetchAdministrators();
    } catch (error) {
      console.error("❌ Error creating administrator:", error);
      alert("❌ Не вдалося створити адміністратора.");
    }
  };

  const deleteAdministrator = async (id) => {
    try {
      const confirmed = window.confirm("Ви впевнені, що хочете видалити цього адміністратора?");
      if (!confirmed) return;

      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.status === 204) {
        alert("✅ Адміністратора видалено.");
        fetchAdministrators();
      } else {
        throw new Error("❌ Не вдалося видалити.");
      }
    } catch (error) {
      console.error("❌ Error deleting administrator:", error);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1 style={{ color: "#003366", textAlign: "center" }}>Адміністратори</h1>

      <form onSubmit={createAdministrator} style={{ marginBottom: "40px" }}>
        <h2>➕ Додати нового адміністратора</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {["first_name", "last_name", "phone", "email", "password"].map((field) => (
            <input
              key={field}
              type={field === "email" ? "email" : field === "password" ? "password" : "text"}
              placeholder={field.replace("_", " ").replace(/^./, (c) => c.toUpperCase())}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              required
              style={{
                padding: "10px",
                width: "200px",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
          ))}
        </div>
        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Додати
        </button>
      </form>

      <h2>📋 Список адміністраторів</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#003366", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>ID</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Імʼя</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Прізвище</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Телефон</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Email</th>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {administrators.map((admin) => (
            <tr key={admin.id}>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{admin.id}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{admin.first_name}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{admin.last_name}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{admin.phone}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>{admin.email}</td>
              <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                <button
                  onClick={() => deleteAdministrator(admin.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Administrators;
