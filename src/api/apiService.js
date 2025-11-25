const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";

console.log("API Base URL:", API_BASE_URL);

const api = {
    // --
    // USER SESSION HELPERS
    // --
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

    // --
    // LOGIN
    // --
    async login(username, password) {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/method/countyhealth_backend.api.login`,
                {
                    method: "POST",
                    headers: {'Content-Type': "application/json"},
                    body: JSON.stringify({ username, password }),
                }
            );
            
            console.log("Login response:", response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

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

    // --
    // LOGOUT
    // --
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

    // --
    // GET DASHBOARD
    // --
    async getDashboard(countyId = null) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");
            
            const url = countyId
                ? `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboard?token=${token}&county_id=${countyId}`
                : `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboard?token=${token}`;
                
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
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

    // ---
    // GET ALL COUNTIES (Super admin)
    // ---
    async getAllCounties(search = null, page = 1, pageSize = 50) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");

            let url = `${API_BASE_URL}/api/method/countyhealth_backend.api.get_all_counties?token=${token}&page=${page}&page_size=${pageSize}`;
            
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            
            const res = await fetch(url);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.exe || data.exception) {
                throw new Error(data.exception || "Failed to load counties");
            }
            
            return data.message;
        } catch (error) {
            console.error("getAllCounties error:", error);
            throw error;
        }
    },

    // ---
    // CREATE COUNTY
    // ---
    async createCounty(countyData) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `${API_BASE_URL}/api/method/countyhealth_backend.api.create_county`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        name: countyData.name,
                        county_name: countyData.county_name,
                        login_username: countyData.login_username,
                        login_password: countyData.login_password,
                        dashboard_url: countyData.dashboard_url,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.exc || data.exception) {
                throw new Error(data.exception || data._server_messages || "Failed to create county");
            }

            return data.message;
        } catch (error) {
            console.error("createCounty error:", error);
            throw error;
        }
    },

    // ---
    // UPDATE COUNTY
    // ---
    async updateCounty(countyId, updates) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `${API_BASE_URL}/api/method/countyhealth_backend.api.update_county`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        county_id: countyId,
                        ...updates,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.exc || data.exception) {
                throw new Error(data.exception || data._server_messages || "Failed to update county");
            }

            return data.message;
        } catch (error) {
            console.error("updateCounty error:", error);
            throw error;
        }
    },

    // ---
    // DELETE COUNTY
    // ---
    async deleteCounty(countyId) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");

            const response = await fetch(
                `${API_BASE_URL}/api/method/countyhealth_backend.api.delete_county`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json" },
                    body: JSON.stringify({
                        token,
                        county_id: countyId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.exc || data.exception) {
                throw new Error(data.exception || "Failed to delete county");
            }

            return data.message;
        } catch (error) {
            console.error("deleteCounty error:", error);
            throw error;
        }
    },

    // ---
    // GET COUNTY DETAILS
    // ---
    async getCountyDetails(countyId) {
        try {
            const token = this.getToken();
            if (!token) throw new Error("Not authenticated");

            const url = `${API_BASE_URL}/api/method/countyhealth_backend.api.get_county_details?token=${token}&county_id=${countyId}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            if (data.exe || data.exception) {
                throw new Error(data.exception || "Failed to load county details");
            }

            return data.message;
        } catch (error) {
            console.error("getCountyDetails error:", error);
            throw error;
        }
    },
};

export default api;
