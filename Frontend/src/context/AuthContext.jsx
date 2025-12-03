import { useState } from "react";
import { AuthContext } from "./AuthCore.js";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refreshToken")
  );
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
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
      localStorage.setItem("token", jwtToken);
    } else {
      setToken(null);
      localStorage.removeItem("token");
    }

    if (jwtRefreshToken) {
      setRefreshToken(jwtRefreshToken);
      localStorage.setItem("refreshToken", jwtRefreshToken);
    } else {
      setRefreshToken(null);
      localStorage.removeItem("refreshToken");
    }

    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
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
