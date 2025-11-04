import React, { useEffect, useState } from "react";
import api from "../api/apiService";
import { MapPin, ExternalLink, AlertCircle } from "lucide-react";

export default function DashboardPage({ user, onLogout }) {
  const [dashboardPayload, setDashboardPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCounties, setAllCounties] = useState([]);
  const [selectedCountyId, setSelectedCountyId] = useState(user.county_id || "");
  const [error, setError] = useState(null);
  const [iframeError, setIframeError] = useState(false);

  // Load dashboard payload
  const loadDashboard = async (countyId = null) => {
    setLoading(true);
    setError(null);
    setIframeError(false);

    try {
      const payload = await api.getDashboard(countyId);
      console.log("Dashboard payload:", payload);
      
      setDashboardPayload(payload);

      // Update stored user for non-superusers
      if (!user.is_super_user && payload.county_name) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        stored.county_name = payload.county_name;
        localStorage.setItem("user", JSON.stringify(stored));
      }
    } catch (err) {
      console.error("loadDashboard error", err);
      setError(err.message || "Failed to load dashboard");
      setDashboardPayload(null);
    } finally {
      setLoading(false);
    }
  };

  // Load counties if superuser
  const loadAllCounties = async () => {
    try {
      const counties = await api.getAllCounties();
      setAllCounties(counties || []);

      // Auto-select first if none selected
      if (!selectedCountyId && counties?.length) {
        const id = counties[0].county_id;
        setSelectedCountyId(id);
        await loadDashboard(id);
      }
    } catch (err) {
      console.error("loadAllCounties error", err);
      setError(err.message || "Failed to load counties");
    }
  };

  useEffect(() => {
    if (user.is_super_user) {
      loadAllCounties();
    } else {
      loadDashboard();
    }
  }, []);

  const onCountyChange = async (e) => {
    const id = e.target.value;
    setSelectedCountyId(id);
    await loadDashboard(id);
  };

  const openInNewTab = () => {
    const url = dashboardPayload?.dashboard_url;
    if (url && url.includes("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No valid dashboard URL configured for this county");
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-4">County Dashboard</h2>
          <nav className="space-y-2">
            <button
              disabled
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold"
            >
              <MapPin className="w-4 h-4" />
              County Dashboard
            </button>
            <button
              onClick={openInNewTab}
              disabled={!dashboardPayload?.dashboard_url}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </button>
          </nav>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-3">Logged in as</div>
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-800">
              {dashboardPayload?.county_name || user.county_name}
            </div>
            <div className="text-xs text-gray-500">
              {user.is_super_user ? "Super Admin" : "County User"}
            </div>
          </div>

          {user.is_super_user && (
            <select
              value={selectedCountyId || ""}
              onChange={onCountyChange}
              className="w-full border px-2 py-2 rounded text-sm mb-3 focus:ring-2 focus:ring-blue-600 outline-none"
            >
              <option value="">Select county</option>
              {allCounties.map((c) => (
                <option key={c.county_id} value={c.county_id}>
                  {c.county_name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onLogout}
            className="w-full text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 bg-gray-50">
        <div className="h-full w-full flex flex-col">
          {/* Top bar */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {dashboardPayload?.county_name || user.county_name} Dashboard
              </h1>
              <div className="text-sm text-gray-500">Unified county dashboard</div>
            </div>
            <div>
              <button
                onClick={openInNewTab}
                disabled={!dashboardPayload?.dashboard_url}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-gray-600">Loading dashboard...</div>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <div className="text-red-600 text-lg font-medium mb-2">Error Loading Dashboard</div>
                <div className="text-gray-600 mb-4">{error}</div>
                <button
                  onClick={() => loadDashboard(selectedCountyId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : !dashboardPayload?.dashboard_url || !dashboardPayload.dashboard_url.includes("http") ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">Dashboard Not Configured</div>
                <div className="text-center">
                  No dashboard URL has been configured for {dashboardPayload?.county_name || "this county"}.
                  <br />
                  Please contact your administrator to set up the dashboard.
                </div>
                <button
                  onClick={openInNewTab}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Opening Anyway
                </button>
              </div>
            ) : iframeError ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">Dashboard Cannot Be Embedded</div>
                <div className="text-center mb-4">
                  The dashboard cannot be displayed in an iframe due to security restrictions.
                  <br />
                  Please open it in a new tab instead.
                </div>
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open in New Tab
                </button>
              </div>
            ) : (
              <iframe
                src={dashboardPayload.dashboard_url}
                title={`${dashboardPayload.county_name} Dashboard`}
                className="w-full h-full border-0"
                allowFullScreen
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

