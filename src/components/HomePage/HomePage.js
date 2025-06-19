import React, { useState } from "react";

const steps = [
  {
    emoji: "💡",
    title: "Подача ідеї",
    description: "Запропонуй, що тебе турбує або яку ідею хочеш реалізувати.",
    example: "Наприклад: «Зробити велопарковку біля школи №3»",
    bgImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?fit=crop&w=1600&q=80"
  },
  {
    emoji: "🧑‍⚖️",
    title: "Перевірка",
    description: "Ми швидко перевіримо, чи ідея підходить для розгляду.",
    example: "Наприклад: чи є вона в межах бюджету або належить до нашої компетенції.",
    bgImage: "https://images.unsplash.com/photo-1616587897395-874c3d4f2f8b?fit=crop&w=1600&q=80"
  },
  {
    emoji: "💬",
    title: "Обговорення",
    description: "Ідею побачать інші — вони можуть додати коментарі або покращення.",
    example: "Наприклад: хтось запропонує об'єднати велопарковку з веломайстернею.",
    bgImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?fit=crop&w=1600&q=80"
  },
  {
    emoji: "📝",
    title: "Оформлення ідеї",
    description: "Ми допоможемо чітко сформулювати деталі для розгляду.",
    example: "Наприклад: вкажемо місце, вартість, терміни реалізації.",
    bgImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?fit=crop&w=1600&q=80"
  },
  {
    emoji: "👩‍⚖️",
    title: "Жюрі",
    description: "Команда експертів переглядає ідею та голосує.",
    example: "Наприклад: оцінюють користь, бюджет, реалістичність.",
    bgImage: "https://images.unsplash.com/photo-1600209141871-38c2f91a32ed?fit=crop&w=1600&q=80"
  },
  {
    emoji: "✅",
    title: "Рішення",
    description: "Фінальне рішення: реалізуємо чи доопрацьовуємо.",
    example: "Наприклад: ідею схвалено — час запускати!",
    bgImage: "https://images.unsplash.com/photo-1583912268184-98729b6ab3c5?fit=crop&w=1600&q=80"
  },
  {
    emoji: "🚚",
    title: "Реалізація",
    description: "Ідея оживає — від задуму до реального втілення.",
    example: "Наприклад: почали будівництво велопарковки 🛠️",
    bgImage: "https://images.unsplash.com/photo-1581090700227-1f9ec10d0c5f?fit=crop&w=1600&q=80"
  }
];

const HomePage = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState("next");

  const next = () => {
    if (current < steps.length) {
      setDirection("next");
      setCurrent((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setDirection("prev");
      setCurrent((prev) => prev - 1);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          current < steps.length ? `url(${steps[current].bgImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        textAlign: "center",
        transition: "background-image 0.6s ease",
        fontFamily: "Arial, sans-serif",
        animation: direction === "next" ? "slideInRight 0.5s" : "slideInLeft 0.5s"
      }}
    >
      {current < steps.length ? (
        <>
          <div style={{ fontSize: "4em", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
            {steps[current].emoji}
          </div>
          <h2 style={{ fontSize: "2em", margin: "20px 0", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.7)" }}>
            {steps[current].title}
          </h2>
          <p style={{ fontSize: "1.2em", maxWidth: "600px", color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}>
            {steps[current].description}
          </p>
          <p style={{ fontStyle: "italic", marginTop: "20px", color: "#eee" }}>
            {steps[current].example}
          </p>

          <div style={{ marginTop: "40px", display: "flex", gap: "20px" }}>
            <button
              onClick={prev}
              disabled={current === 0}
              style={{
                padding: "12px 24px",
                fontSize: "1em",
                borderRadius: "30px",
                border: "none",
                backgroundColor: current === 0 ? "#999" : "#007bff",
                color: "#fff",
                cursor: current === 0 ? "default" : "pointer",
              }}
            >
              ⬅️ Назад
            </button>
            <button
              onClick={next}
              disabled={current === steps.length - 1}
              style={{
                padding: "12px 24px",
                fontSize: "1em",
                borderRadius: "30px",
                border: "none",
                backgroundColor: current === steps.length - 1 ? "#999" : "#007bff",
                color: "#fff",
                cursor: current === steps.length - 1 ? "default" : "pointer",
              }}
            >
              Далі ➡️
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4em", marginBottom: "20px" }}>🚀</div>
          <h2 style={{ fontSize: "2em", marginBottom: "20px", color: "#222" }}>
            Готовий подати свою ідею?
          </h2>
          <p style={{ fontSize: "1.1em", marginBottom: "30px", color: "#444" }}>
            Натисни кнопку нижче — ми вже чекаємо саме на тебе!
          </p>
          <a
            href="/auth"
            style={{
              padding: "16px 32px",
              backgroundColor: "#ff6600",
              color: "#fff",
              borderRadius: "40px",
              fontSize: "1em",
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            Подати ідею
          </a>
        </div>
      )}

      {/* 🔽 Анімація слайдів */}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(80px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-80px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
