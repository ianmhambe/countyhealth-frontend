const API_BASE_URL = "http://127.0.0.1:8001";

const api = {
  // ------------------------------------------
  // USER SESSION HELPERS
  // ------------------------------------------
  saveUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  getStoredUser() {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.token) return null;
      return parsed;
    } catch {
      return null;
    }
  },

  clearUser() {
    localStorage.removeItem("user");
  },

  getToken() {
    const u = this.getStoredUser();
    return u?.token || null;
  },

  // ------------------------------------------
  // LOGIN
  // ------------------------------------------
  async login(username, password) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/countyhealth_backend.api.login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (data.exc || data.exception) {
        throw new Error("Invalid username or password");
      }

      if (!data.message) {
        throw new Error("Invalid response from server");
      }

      this.saveUser(data.message);
      return data.message;
    } catch (error) {
      console.error("Login API error:", error);
      throw new Error(error.message || "Login failed");
    }
  },

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------
  async logout() {
    try {
      const token = this.getToken();
      if (!token) {
        this.clearUser();
        return;
      }

      await fetch(
        `${API_BASE_URL}/api/method/countyhealth_backend.api.logout?token=${token}`,
        { method: "POST" }
      );

      this.clearUser();
    } catch (error) {
      console.error("Logout error:", error);
      this.clearUser();
    }
  },

  // ------------------------------------------
  // GET DASHBOARD
  // ------------------------------------------
  async getDashboard(countyId = null) {
    try {
      const token = this.getToken();
      if (!token) throw new Error("Not authenticated");

      const url = countyId
        ? `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboard?token=${token}&county_id=${countyId}`
        : `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboard?token=${token}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.exc || data.exception) {
        throw new Error(data.exception || "Failed to load dashboard");
      }

      return data.message;
    } catch (error) {
      console.error("getDashboard error:", error);
      throw error;
    }
  },

  // ------------------------------------------
  // GET ALL COUNTIES (Super admin)
  // ------------------------------------------
  async getAllCounties() {
    try {
      const token = this.getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${API_BASE_URL}/api/method/countyhealth_backend.api.get_all_counties?token=${token}`
      );
      const data = await res.json();

      if (data.exc || data.exception) {
        throw new Error(data.exception || "Failed to load counties");
      }

      return data.message;
    } catch (error) {
      console.error("getAllCounties error:", error);
      throw error;
    }
  },
};

export default api;