import React, { useState, useEffect } from "react";

const articles = [
  {
    title: "Як інновації змінюють світ: надихаючі історії успіху",
    content:
      "Ідеї, які колись здавались божевільними, сьогодні формують наше майбутнє.",
  },
  {
    title: "Наука про проблеми: як виявлення проблем може призвести до інновацій",
    content:
      "Багато відкриттів були зроблені завдяки тому, що хтось побачив проблему.",
  },
  {
    title: "Мислення поза рамками: чому важливо ділитися ідеями",
    content:
      "Дослідження показують, що ідеї, висловлені вчасно, можуть мати потужний вплив.",
  },
];

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll(".fade-in");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    });
    sections.forEach((section) => observer.observe(section));
  }, []);

  const themeBackground = darkMode ? "#121212" : "#f7f7f9";
  const textColor = darkMode ? "#ffffff" : "#1a1a1a";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: themeBackground, color: textColor }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>IdeaHub</h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: "8px 16px",
            borderRadius: "20px",
            backgroundColor: darkMode ? "#444" : "#eee",
            color: darkMode ? "#fff" : "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          {darkMode ? "Світла тема" : "Темна тема"}
        </button>
      </header>

      {/* Hero Section */}
      <div
        style={{
          position: "relative",
          minHeight: "90vh",
          overflow: "hidden",
          padding: "60px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
            filter: darkMode ? "brightness(0.4)" : "brightness(0.7)",
          }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-aerial-shot-of-a-truck-on-a-highway-5261/1080p.mp4"
            type="video/mp4"
          />
        </video>

        <div>
          <h1 style={{ fontSize: "3em", fontWeight: 800, lineHeight: 1.2, color: darkMode ? "#fff" : "#003366" }}>
            Ідеї, що рухають <span style={{ color: "#007bff" }}>IdeaHub</span>
          </h1>
          <p style={{ fontSize: "1.2em", maxWidth: "550px", lineHeight: "1.7", margin: "20px 0", color: darkMode ? "#ccc" : "#333" }}>
            Ваша думка має значення — діліться своїми ідеями, проблемами та рішеннями, щоб зробити логістичні процеси кращими!
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <button
              style={{
                padding: "14px 28px",
                fontSize: "1em",
                borderRadius: "30px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Подати ідею
            </button>
            <button
              style={{
                padding: "14px 28px",
                fontSize: "1em",
                borderRadius: "30px",
                backgroundColor: darkMode ? "#444" : "#ddd",
                color: darkMode ? "#fff" : "#333",
                border: "none",
                cursor: "pointer",
              }}
            >
              Дізнатись більше
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <img
            src="https://images.unsplash.com/photo-1600180758890-d53f3215c38a?auto=format&fit=crop&w=800&q=80"
            alt="Logistics"
            style={{
              maxWidth: "100%",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          />
          <p style={{ marginTop: "10px", fontWeight: "500", color: darkMode ? "#aaa" : "#555" }}>70,000+ переглядів</p>
        </div>
      </div>

      {/* Article Section */}
      <section style={{ padding: "60px 30px", backgroundColor: darkMode ? "#1e1e1e" : "#fff" }}>
        <h2 style={{ textAlign: "center", fontSize: "2em", fontWeight: "bold", color: darkMode ? "#fff" : "#004085" }}>
          Цікаві Статті
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "30px",
            marginTop: "40px",
          }}
        >
          {articles.map((article, index) => (
            <div
              key={index}
              style={{
                backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
                color: darkMode ? "#f0f0f0" : "#333",
                padding: "20px",
                borderRadius: "16px",
                width: "300px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ fontSize: "1.3em", fontWeight: "600", marginBottom: "10px" }}>{article.title}</h3>
              <p style={{ fontSize: "1em", lineHeight: "1.6" }}>{article.content}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          header {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;