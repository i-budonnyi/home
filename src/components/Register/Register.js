/* eslint-disable no-console */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://backend-avtologistika.onrender.com/api";
const API_REGISTER_URL = `${API_BASE}/authRoutes/register`;

const decodeUnicode = (str) => {
  try {
    return decodeURIComponent(
      JSON.parse('"' + str.replace(/"/g, '\\"') + '"')
    );
  } catch (e) {
    console.error("[Unicode Decode Error]:", e.message);
    return str;
  }
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { first_name, last_name, email, phone, password } = formData;

    if (!first_name || !last_name || !email || !phone || !password) {
      setError("Будь ласка, заповніть усі поля.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone,
          password,
          role_id: 2,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${decodeUnicode(txt)}`);
      }

      const data = await res.json();
      setSuccess(
        decodeUnicode(data.message || "Реєстрація пройшла успішно!")
      );

      setTimeout(() => navigate("/worker"), 2000);
    } catch (err) {
      setError(err.message || "Сталася помилка при реєстрації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.formContainer}>
        <h1 style={styles.title}>Реєстрація</h1>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.row}>
            <input
              type="text"
              name="first_name"
              placeholder="Ім'я"
              value={formData.first_name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Прізвище"
              value={formData.last_name}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Телефон"
              value={formData.phone}
              onChange={handleInputChange}
              style={styles.input}
              required
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleInputChange}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Завантаження..." : "Зареєструватися"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f8ff",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  row: {
    display: "flex",
    gap: "15px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
  success: {
    color: "green",
    textAlign: "center",
    fontWeight: "bold",
  },
};

export default RegisterPage;
