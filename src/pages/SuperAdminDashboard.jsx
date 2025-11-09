import React, { useState, useEffect } from "react";
import {
  Building2,
  Settings,
  Eye,
  MapPin,
  ExternalLink,
  AlertCircle,
  ChevronDown,
  Shield,
} from "lucide-react";
import api from "../api/apiService";
import CountyManagementPage from "./CountyManagementPage";

export default function SuperAdminDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard' or 'management'
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [dashboardPayload, setDashboardPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [iframeError, setIframeError] = useState(false);
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);

  // Load all counties on mount
  useEffect(() => {
    loadCounties();
  }, []);

  // Load counties list
  const loadCounties = async () => {
    try {
      const result = await api.getAllCounties();
      setCounties(result.counties || []);
      
      // Auto-select first county if none selected
      if (!selectedCounty && result.counties?.length > 0) {
        selectCounty(result.counties[0]);
      }
    } catch (err) {
      console.error("Failed to load counties:", err);
      setError(err.message || "Failed to load counties");
    }
  };

  // Select and load a county dashboard
  const selectCounty = async (county) => {
    setSelectedCounty(county);
    setShowCountyDropdown(false);
    setLoading(true);
    setError(null);
    setIframeError(false);

    try {
      const payload = await api.getDashboard(county.county_id);
      setDashboardPayload(payload);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || "Failed to load dashboard");
      setDashboardPayload(null);
    } finally {
      setLoading(false);
    }
  };

  // Open dashboard in new tab
  const openInNewTab = () => {
    const url = dashboardPayload?.dashboard_url || selectedCounty?.dashboard_url;
    if (url && url.includes("http")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No valid dashboard URL configured for this county");
    }
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIframeError(true);
  };

  // If management view is active, show CountyManagementPage
  if (activeView === "management") {
    return (
      <CountyManagementPage
        user={user}
        onLogout={onLogout}
        onBackToDashboard={() => {
          setActiveView("dashboard");
          loadCounties(); // Refresh counties list
        }}
      />
    );
  }

  // Dashboard view
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-6">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeView === "dashboard"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Eye className="w-4 h-4" />
              View Dashboards
            </button>
            <button
              onClick={() => setActiveView("management")}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition ${
                activeView === "management"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="w-4 h-4" />
              Manage Counties
            </button>
          </nav>

          {/* County Selector */}
          {activeView === "dashboard" && (
            <div className="border-t pt-4">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                Selected County
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowCountyDropdown(!showCountyDropdown)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition text-left"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {selectedCounty?.county_name || "Select County"}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </button>

                {/* Dropdown */}
                {showCountyDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {counties.map((county) => (
                      <button
                        key={county.county_id}
                        onClick={() => selectCounty(county)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0 ${
                          selectedCounty?.county_id === county.county_id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-gray-800">
                          {county.county_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {county.login_username}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div>
          <div className="text-sm text-gray-500 mb-2">Logged in as</div>
          <div className="text-sm font-medium text-gray-800 mb-4">
            Super Admin
          </div>
          <button
            onClick={onLogout}
            className="w-full text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50">
        <div className="h-full w-full flex flex-col">
          {/* Top Bar */}
          <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                {selectedCounty?.county_name || "County"} Dashboard
              </h1>
              <div className="text-sm text-gray-500">
                Viewing as Super Admin
              </div>
            </div>
            <button
              onClick={openInNewTab}
              disabled={!dashboardPayload?.dashboard_url && !selectedCounty?.dashboard_url}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </button>
          </div>

          {/* Dashboard Content Area */}
          <div className="flex-1 overflow-hidden">
            {!selectedCounty ? (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <Building2 className="w-16 h-16 text-gray-300 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">
                  No County Selected
                </div>
                <div className="text-center text-gray-600">
                  Select a county from the sidebar to view its dashboard
                </div>
              </div>
            ) : loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-gray-600">Loading dashboard...</div>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-6">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <div className="text-red-600 text-lg font-medium mb-2">
                  Error Loading Dashboard
                </div>
                <div className="text-gray-600 mb-4">{error}</div>
                <button
                  onClick={() => selectCounty(selectedCounty)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : !dashboardPayload?.dashboard_url &&
              !selectedCounty?.dashboard_url ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">
                  Dashboard Not Configured
                </div>
                <div className="text-center">
                  No dashboard URL has been configured for{" "}
                  {selectedCounty.county_name}.
                  <br />
                  Please configure it in the County Management section.
                </div>
                <button
                  onClick={() => setActiveView("management")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Management
                </button>
              </div>
            ) : iframeError ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6">
                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                <div className="text-lg font-medium text-gray-700 mb-2">
                  Dashboard Cannot Be Embedded
                </div>
                <div className="text-center mb-4">
                  The dashboard cannot be displayed in an iframe due to security
                  restrictions.
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
                src={
                  dashboardPayload?.dashboard_url ||
                  selectedCounty?.dashboard_url
                }
                title={`${selectedCounty.county_name} Dashboard`}
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