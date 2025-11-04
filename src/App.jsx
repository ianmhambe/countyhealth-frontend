import React, { useState, useEffect } from "react";
import api from "./api/apiService";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Load stored session on startup
  useEffect(() => {
    const u = api.getStoredUser();
    setUser(u);
    setLoadingUser(false);
  }, []);

  // Handle login
  const handleLogin = async (username, password) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const userData = await api.login(username, password);
      setUser(userData);
    } catch (err) {
      setLoginError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  return <DashboardPage user={user} onLogout={handleLogout} />;
}