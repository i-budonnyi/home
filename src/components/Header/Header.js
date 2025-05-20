import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setUserName(null);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("userName");
    if (token && name) {
      setUserName(name);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        fontSize: "14px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "none",
        background: "transparent",
        color: "inherit",
      }}
    >
      <div
        style={{ cursor: "pointer", fontWeight: 500 }}
        onClick={() => navigate("/")}
      >
        Avtologistika
      </div>

      <nav style={{ display: "flex", gap: "12px" }}>
        {userName ? (
          <>
            <span
              onClick={() => navigate("/worker")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              {userName}
            </span>
            <span
              onClick={handleLogout}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Вийти
            </span>
          </>
        ) : (
          <>
            <span
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Вхід
            </span>
            <span
              onClick={() => navigate("/register")}
              style={{ cursor: "pointer", textDecoration: "underline" }}
            >
              Реєстрація
            </span>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
