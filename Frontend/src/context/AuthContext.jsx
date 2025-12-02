// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("ws_token"));
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("ws_refresh_token")
  );
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ws_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (jwtToken, jwtRefreshToken = null, userData = null) => {
    console.log("AuthContext.login called", {
      jwtToken,
      jwtRefreshToken,
      userData,
    });

    if (jwtToken) {
      setToken(jwtToken);
      localStorage.setItem("ws_token", jwtToken);
    } else {
      setToken(null);
      localStorage.removeItem("ws_token");
    }

    if (jwtRefreshToken) {
      setRefreshToken(jwtRefreshToken);
      localStorage.setItem("ws_refresh_token", jwtRefreshToken);
    } else {
      setRefreshToken(null);
      localStorage.removeItem("ws_refresh_token");
    }

    if (userData) {
      setUser(userData);
      localStorage.setItem("ws_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("ws_token");
    localStorage.removeItem("ws_refresh_token");
    localStorage.removeItem("ws_user");
  };

  const value = {
    token,
    refreshToken,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🔥 This is the named export Vite is complaining about
export const useAuth = () => useContext(AuthContext);
