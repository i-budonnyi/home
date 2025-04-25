import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://192.168.0.116:5000/api/authRoutes"; // Базовий маршрут для API

const apiRequest = async (endpoint, method = "GET", data = null) => {
  console.log("🔍 [REST API] Запит до сервера:", endpoint, method, data);
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Сервер повернув помилку: ${response.status}`, errorText);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ [REST API] Успішна відповідь:", result);
    return result;
  } catch (error) {
    console.error("❌ [REST API] Помилка:", error.message);
    throw error;
  }
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ [Input] Зміна поля ${name}:`, value);
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    console.log("🔍 [Register] Початок реєстрації. Дані форми:", formData);

    const { first_name, last_name, email, password, phone } = formData;

    if (!email || !password || !first_name || !last_name || !phone) {
      console.error("❌ [Register] Всі поля обов'язкові!");
      setError("Всі поля обов'язкові!");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🚀 [Register] Відправка запиту до REST API сервера...");
      const data = await apiRequest("register", "POST", {
        first_name,
        last_name,
        email,
        password,
        phone,
        role_id: 2, // Призначення ролі за замовчуванням
      });

      setSuccess(data.message || "Реєстрація успішна!");
      console.log("✅ [Register] Реєстрація успішна:", data);
      setTimeout(() => navigate("/worker"), 2000);
    } catch (err) {
      console.error("❌ [Register] Помилка реєстрації:", err.message);
      setError(err.message || "Помилка сервера.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f8ff",
      }}
    >
      <div
        className="register-container"
        style={{
          backgroundColor: "#ffffff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333333" }}>Реєстрація</h1>
        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="text"
              name="first_name"
              placeholder="Ім'я"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Прізвище"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
            <input
              type="text"
              name="phone"
              placeholder="Телефон"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            />
          </div>
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "12px 20px",
              backgroundColor: isLoading ? "#cccccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {isLoading ? "Завантаження..." : "Зареєструватися"}
          </button>
          {error && (
            <div
              className="error-message"
              style={{ color: "red", textAlign: "center" }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="success-message"
              style={{ color: "green", textAlign: "center" }}
            >
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
