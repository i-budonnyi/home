import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://idea-backend.onrender.com/api/authRoutes/register";

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const { first_name, last_name, email, password, phone } = formData;

    if (!first_name || !last_name || !email || !password || !phone) {
      setError("\u0412\u0441\u0456 \u043F\u043E\u043B\u044F \u043E\u0431\u043E\u0432'\u044F\u0437\u043A\u043E\u0432\u0456!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          password,
          phone,
          role_id: 2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "\u041F\u043E\u043C\u0438\u043B\u043A\u0430 \u0440\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u0457");
      }

      const result = await response.json();
      setSuccess(result.message || "\u0420\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u044F \u0443\u0441\u043F\u0456\u0448\u043D\u0430!");
      setTimeout(() => navigate("/worker"), 1500);
    } catch (err) {
      setError(err.message || "\u0421\u0442\u0430\u043B\u0430\u0441\u044F \u043D\u0435\u0432\u0456\u0434\u043E\u043C\u0430 \u043F\u043E\u043C\u0438\u043B\u043A\u0430.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f8ff",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#333" }}>\u0420\u0435\u0454\u0441\u0442\u0440\u0430\u0446\u0456\u044F</h1>
        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div style={{ display: "flex", gap: "15px" }}>
            <input
              type="text"
              name="first_name"
              placeholder="\u0406\u043C'\u044F"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="last_name"
              placeholder="\u041F\u0440\u0456\u0437\u0432\u0438\u0449\u0435"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              style={inputStyle}
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
              style={inputStyle}
            />
            <input
              type="text"
              name="phone"
              placeholder="\u0422\u0435\u043B\u0435\u0444\u043E\u043D"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>
          <input
            type="password"
            name="password"
            placeholder="\u041F\u0430\u0440\u043E\u043B\u044C"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "12px",
              backgroundColor: isLoading ? "#cccccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {isLoading ? "\u0417\u0430\u0432\u0430\u043D\u0442\u0430\u0436\u0435\u043D\u043D\u044F..." : "\u0417\u0430\u0440\u0435\u0454\u0441\u0442\u0440\u0443\u0432\u0430\u0442\u0438\u0441\u044F"}
          </button>
          {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  flex: 1,
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
};

export default RegisterPage;
