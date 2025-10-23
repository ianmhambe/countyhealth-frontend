import { useEffect, useState } from 'react';
import { Activity, Calendar, Users, FileText, UserPlus, LogOut, AlertCircle, Shield } from 'lucide-react';
import CountySelector from '../components/CountySelector.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import api from '../api/apiService.js';

export default function DashboardPage({ countyName, isSuperUser, onLogout }) {
  const [dashboards, setDashboards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCountyId, setSelectedCountyId] = useState(null);
  const [selectedCountyName, setSelectedCountyName] = useState(countyName);

  // Load dashboards automatically if not a super user
  useEffect(() => {
    if (!isSuperUser) loadDashboards();
  }, [isSuperUser]);

  const loadDashboards = async (countyId = null) => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getDashboards(countyId);
      if (result.message?.success) {
        setDashboards(result.message.dashboards);
        if (result.message.county_name) setSelectedCountyName(result.message.county_name);
      } else {
        setError(result.message?.message || 'Failed to load dashboards');
      }
    } catch (err) {
      setError('Connection error. Please check your backend.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountySelect = (countyId, countyName) => {
    setSelectedCountyId(countyId);
    setSelectedCountyName(countyName);
    loadDashboards(countyId);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      onLogout();
    }
  };

  const openDashboard = (url) => window.open(url, '_blank');

  const dashboardConfig = [
    {
      key: 'visits',
      title: 'Visits',
      description: 'View and analyze patient visit statistics and trends',
      icon: Activity
    },
    {
      key: 'appointments',
      title: 'Appointments',
      description: 'Track scheduled appointments and attendance rates',
      icon: Calendar
    },
    {
      key: 'encounters',
      title: 'Encounters',
      description: 'Monitor patient encounters and clinical interactions',
      icon: FileText
    },
    {
      key: 'enrollment',
      title: 'Enrollment',
      description: 'Manage patient enrollment and registration data',
      icon: UserPlus
    },
    {
      key: 'patients',
      title: 'Patients',
      description: 'Access comprehensive patient records and demographics',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {isSuperUser && <Shield className="w-6 h-6" />}
                {selectedCountyName} Health Dashboard
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {isSuperUser
                  ? 'Super Admin Access - All Counties'
                  : 'Access your health data and insights'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isSuperUser && (
                <CountySelector
                  onSelectCounty={handleCountySelect}
                  selectedCounty={selectedCountyName}
                />
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8">
        {/* Super admin notice */}
        {isSuperUser && !dashboards && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-center">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Super Admin Mode</h2>
            <p className="text-gray-600">
              Please select a county from the dropdown above to view its dashboards
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboards...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboards</h2>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        )}

        {/* Dashboards */}
        {!loading && !error && dashboards && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Available Dashboards
              </h2>
              <p className="text-gray-600">
                Click on any card to open the dashboard in a new tab
              </p>
            </div>

            <div className='grid grid-cols-2'> 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardConfig.map((config) => (
                <DashboardCard
                  key={config.key}
                  title={config.title}
                  description={config.description}
                  icon={config.icon}
                  onClick={() => openDashboard(dashboards[config.key])}
                />
              ))}
            </div>

          <div className='bg-blue-50'>


            </div>

            </div>

            
          </>
        )}
      </main>
    </div>
  );
}
