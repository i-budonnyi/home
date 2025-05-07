import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = "https://backend-avtologistika.onrender.com/login";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

      if (!response.ok) {
        throw new Error(data.message || "Помилка логіну");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      const redirects = {
        user: "/workpage",
        project_manager: "/pm-projects",
        ambassador: "/ambassadors",
        jury_secretary: "/jury-secretary",
        jury_member: "/jury",
        worker: "/worker",
      };

      const role = data.user?.role;
      navigate(role && redirects[role] ? redirects[role] : "/workpage");
    } catch (err) {
      console.error("[LOGIN ERROR]:", err);
      setError(err.message || "Невідома помилка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2 style={styles.title}>Вхід</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          style={styles.input}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={handleLogin} disabled={isLoading}>
          {isLoading ? "Завантаження..." : "Увійти"}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    fontFamily: "Segoe UI, sans-serif",
  },
  box: {
    backgroundColor: "#fff",
    padding: "30px 40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "12px",
    fontWeight: "bold",
  },
};

export default LoginPage;
