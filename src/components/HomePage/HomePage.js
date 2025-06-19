import React, { useState } from "react";

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

  const themeStyles = {
    backgroundColor: darkMode ? "#121212" : "#f0f4f8",
    color: darkMode ? "#ffffff" : "#333",
  };

  const sectionBg = darkMode ? "#1e1e1e" : "#ffffff";
  const textColor = darkMode ? "#ffffff" : "#004085";

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        ...themeStyles,
        transition: "all 0.3s ease",
      }}
    >
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
            zIndex: -1,
            filter: darkMode ? "brightness(0.5)" : "brightness(0.7)",
          }}
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-driving-through-the-snow-8235/1080p.mp4"
            type="video/mp4"
          />
        </video>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: "10px 20px",
              borderRadius: "20px",
              backgroundColor: darkMode ? "#444" : "#eee",
              color: darkMode ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            {darkMode ? "Світла тема" : "Темна тема"}
          </button>

          <h1 style={{ fontSize: "3em", fontWeight: "bold", color: textColor }}>
            Ідеї, що рухають автологістику
          </h1>
          <p
            style={{
              fontSize: "1.2em",
              lineHeight: "1.6",
              maxWidth: "700px",
              margin: "20px auto",
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
      </div>

      <section
        style={{
          backgroundColor: sectionBg,
          padding: "40px 20px",
          textAlign: "center",
          transition: "all 0.3s ease",
        }}
      >
        <h2 style={{ fontSize: "2em", fontWeight: "bold", color: textColor }}>
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
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                width: "300px",
                textAlign: "left",
                transition: "all 0.3s ease",
              }}
            >
              <h3 style={{ fontSize: "1.5em", marginBottom: "10px" }}>
                {article.title}
              </h3>
              <p style={{ fontSize: "1em", lineHeight: "1.6" }}>{article.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
