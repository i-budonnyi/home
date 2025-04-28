// src/components/context/UserContext.js

import React, { createContext, useContext, useState } from "react";

// 🔥 Обов'язково експортуємо UserContext
export const UserContext = createContext();

// 🔥 Провайдер контексту
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Якщо захочеш додавати юзера

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 🔥 Хук для використання контексту
export const useUser = () => useContext(UserContext);
