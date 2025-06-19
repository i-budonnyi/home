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

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: darkMode ? "#121212" : "#f0f4f8",
        color: darkMode ? "#ffffff" : "#333",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        {/* 🎥 Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-aerial-shot-of-a-truck-on-a-highway-5261/1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* 🟫 Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))",
            zIndex: -1,
          }}
        />

        {/* Decorative SVG */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://www.heropatterns.com/static/svg/hexagons.svg')",
            opacity: 0.05,
            backgroundRepeat: "repeat",
            zIndex: -1,
          }}
        />

        {/* Toggle theme */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 2,
          }}
        >
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
        </div>

        {/* HERO */}
        <div
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 10%",
            gap: "40px",
            zIndex: 1,
          }}
        >
          <div style={{ flex: "1 1 400px" }}>
            <h1
              style={{
                fontSize: "2.8em",
                fontWeight: "bold",
                color: darkMode ? "#ffffff" : "#ffffff",
              }}
            >
              Ідеї, що рухають <span style={{ color: "#59c1ff" }}>IdeaHub</span>
            </h1>
            <p
              style={{
                fontSize: "1.2em",
                lineHeight: "1.6",
                margin: "20px 0",
                maxWidth: "600px",
                color: darkMode ? "#ccc" : "#eaeaea",
              }}
            >
              Ваша думка має значення — діліться своїми ідеями, проблемами та рішеннями, щоб зробити логістичні процеси кращими!
            </p>
            <button
              style={{
                padding: "12px 24px",
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
          </div>

          <div style={{ flex: "1 1 400px", textAlign: "center" }}>
            <img
              src="https://images.unsplash.com/photo-1600180758890-d53f3215c38a?auto=format&fit=crop&w=800&q=80"
              alt="Logistics"
              style={{
                maxWidth: "100%",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ARTICLES */}
      <section
        className="fade-in"
        style={{
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2em", fontWeight: "bold", color: darkMode ? "#fff" : "#004085" }}>
          Цікаві Статті
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          {articles.map((article, index) => (
            <div
              key={index}
              style={{
                backgroundColor: darkMode ? "#2a2a2a" : "#ffffff",
                color: darkMode ? "#f0f0f0" : "#333",
                padding: "20px",
                borderRadius: "12px",
                width: "300px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                textAlign: "left",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: "1.4em", marginBottom: "10px" }}>{article.title}</h3>
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
          .fade-in {
            flex-direction: column !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
