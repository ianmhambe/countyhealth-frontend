import React, { useState, useEffect } from "react";
import {
  Activity,
  Calendar,
  FileText,
  UserPlus,
  Users,
  LogOut,
  MapPin,
} from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import api from "../api/apiService";

export default function DashboardPage({ countyName, isSuperUser, onLogout }) {
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [dashboards, setDashboards] = useState({});
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [allCounties, setAllCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dashboardConfig = [
    {
      key: "visits",
      title: "Visits",
      description: "View and analyze patient visit statistics and trends",
      icon: Activity,
    },
    {
      key: "appointments",
      title: "Appointments",
      description: "Track scheduled appointments and attendance rates",
      icon: Calendar,
    },
    {
      key: "encounters",
      title: "Encounters",
      description: "Monitor patient encounters and clinical interactions",
      icon: FileText,
    },
    {
      key: "enrollment",
      title: "Enrollment",
      description: "Manage patient enrollment and registration data",
      icon: UserPlus,
    },
    {
      key: "patients",
      title: "Patients",
      description: "Access comprehensive patient records and demographics",
      icon: Users,
    },
  ];

  // ✅ Fetch dashboards (for county or current user)
 const loadDashboards = async (countyId = null) => {
  try {
    setLoading(true);
    const response = await api.getDashboards(countyId);
    console.log("Dashboards API raw response:", response);

    // 🧠 Handle different response shapes
    const success = response.success || response.message?.success;
    const dashboards = response.dashboards || response.message?.dashboards;
    const msg =
      typeof response.message === "string"
        ? response.message
        : response.message?.message || "Failed to fetch dashboards";

    if (success) {
      setDashboards(dashboards || {});
    } else {
      throw new Error(msg);
    }
  } catch (err) {
    console.error("Error loading dashboards:", err);
    setError(err.message || JSON.stringify(err));
  } finally {
    setLoading(false);
  }
};


  // ✅ Load all counties (for super admin)
  const loadAllCounties = async () => {
  try {
    const response = await api.getAllCounties();
    console.log("All counties API raw response:", response);

    // 🧠 Handle different response formats
    const success = response.success || response.message?.success;
    const counties = response.counties || response.message?.counties;
    const msg =
      typeof response.message === "string"
        ? response.message
        : response.message?.message || "Failed to load counties";

    if (success) {
      setAllCounties(counties || []);

      // ✅ Auto-select first county
      if (counties && counties.length > 0) {
        const firstCounty = counties[0];
        setSelectedCounty(firstCounty.name || firstCounty.id);
        await loadDashboards(firstCounty.name || firstCounty.id);
      }
    } else {
      throw new Error(msg);
    }
  } catch (err) {
    console.error("Error loading counties:", err);
    setError(err.message || JSON.stringify(err));
  }
};

  // ✅ Initial load
  useEffect(() => {
    if (isSuperUser) {
      loadAllCounties();
    } else {
      loadDashboards();
    }
  }, [isSuperUser]);

  // ✅ Handle county dropdown change
  const handleCountySelect = async (e) => {
    const countyId = e.target.value;
    setSelectedCounty(countyId);
    await loadDashboards(countyId);
  };

  // ✅ Handle card toggle
  const handleCardClick = (key) => {
    setActiveDashboard(activeDashboard === key ? null : key);
  };

  // ✅ Loading & Error UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        Loading dashboards...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-lg">
        {error}
      </div>
    );
  }

  // ✅ Main Layout
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r border-gray-200 p-6 space-y-6 flex flex-col justify-between">
        <div>
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Dashboard</h2>
            <p className="text-sm text-gray-500 mb-6">
              {isSuperUser ? "Super Admin — All Counties" : countyName}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-4">
            {dashboardConfig.map((item) => (
              <button
                key={item.key}
                onClick={() => handleCardClick(item.key)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-all ${
                  activeDashboard === item.key
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium mt-6 w-full px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            {isSuperUser
              ? "Super Admin Dashboard"
              : `${countyName} County Dashboard`}
          </h1>

          {/* ✅ County selector for Super Admin */}
          {isSuperUser && (
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-600" />
              <select
                value={selectedCounty || ""}
                onChange={handleCountySelect}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select a county</option>
                {allCounties.map((county) => (
                  <option key={county.name} value={county.name}>
                    {county.county_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dashboardConfig.map((config) => (
            <DashboardCard
              key={config.key}
              title={config.title}
              description={config.description}
              icon={config.icon}
              onClick={() => handleCardClick(config.key)}
            />
          ))}
        </div>

        {/* Embedded Dashboard */}
        {activeDashboard && (
          <div className="mt-10 bg-white shadow-lg border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {
                  dashboardConfig.find((d) => d.key === activeDashboard)
                    ?.title
                }{" "}
                Dashboard
              </h2>
              <button
                onClick={() => setActiveDashboard(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Close
              </button>
            </div>

            {dashboards[activeDashboard]?.includes("https://") ? (
              <iframe
                src={dashboards[activeDashboard]}
                title={`${activeDashboard} Dashboard`}
                className="w-full h-[700px] rounded-lg border border-gray-300"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>
                  No dashboard available yet for{" "}
                  <span className="font-semibold text-gray-700">
                    {activeDashboard}
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
