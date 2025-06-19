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
      {/* 🎥 Video Background */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
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
            filter: darkMode ? "brightness(0.5)" : "brightness(0.7)",
          }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-driving-through-the-snow-8235/1080p.mp4"
            type="video/mp4"
          />
        </video>

        {/* Decorative SVG Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "url('https://www.heropatterns.com/static/svg/hexagons.svg')",
            opacity: 0.06,
            backgroundRepeat: "repeat",
            zIndex: -1,
          }}
        />

        {/* Header + Toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            position: "absolute",
            width: "100%",
            top: 0,
            zIndex: 2,
          }}
        >
          <h2 style={{ margin: 0 }}>🚚 Avtologistika</h2>
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

        {/* Hero Section */}
        <div
          className="fade-in"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 10%",
            zIndex: 1,
          }}
        >
          <div style={{ flex: 1, zIndex: 2 }}>
            <h1
              style={{
                fontSize: "3em",
                fontWeight: "bold",
                color: darkMode ? "#ffffff" : "#004085",
              }}
            >
              Ідеї, що рухають автологістику
            </h1>
            <p
              style={{
                fontSize: "1.2em",
                maxWidth: "600px",
                lineHeight: "1.6",
                color: darkMode ? "#ccc" : "#333",
              }}
            >
              Ваша думка має значення — діліться своїми ідеями, проблемами та
              рішеннями, щоб зробити логістичні процеси кращими!
            </p>
            <button
              style={{
                marginTop: "20px",
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

          {/* Side Image */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <img
              src="https://source.unsplash.com/600x400/?logistics,truck"
              alt="Logistics illustration"
              style={{
                maxWidth: "100%",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Article Section */}
      <section
        className="fade-in"
        style={{
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2em",
            fontWeight: "bold",
            color: darkMode ? "#ffffff" : "#004085",
          }}
        >
          Цікаві Статті
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px",
            marginTop: "20px",
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
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "left",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: "1.4em", marginBottom: "10px" }}>
                {article.title}
              </h3>
              <p style={{ fontSize: "1em", lineHeight: "1.6" }}>{article.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Styles for animation */}
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
