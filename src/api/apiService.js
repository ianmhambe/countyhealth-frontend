const API_BASE_URL = 'http://localhost:8001';
let authToken = null;

const api = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/method/countyhealth_backend.api.login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.message?.success && data.message?.token) {
      authToken = data.message.token;
      console.log('Token stored:', authToken.substring(0, 8) + '...');
    }
    return data;
  },

  getAllCounties: async () => {
    const response = await fetch(`${API_BASE_URL}/api/method/countyhealth_backend.api.get_all_counties?token=${authToken}`);
    return response.json();
  },

  getDashboards: async (countyId = null) => {
    const url = countyId
      ? `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboards?token=${authToken}&county_id=${countyId}`
      : `${API_BASE_URL}/api/method/countyhealth_backend.api.get_dashboards?token=${authToken}`;
    const response = await fetch(url);
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/method/countyhealth_backend.api.logout?token=${authToken}`, {
      method: 'POST'
    });
    authToken = null;
    return response.json();
  }
};

export default api;
