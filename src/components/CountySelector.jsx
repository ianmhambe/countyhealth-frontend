import { useEffect, useState } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import api from '../api/apiService.js';

export default function CountySelector({ onSelectCounty, selectedCounty }) {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await api.getAllCounties();
        if (result.message?.success) setCounties(result.message.counties);
      } catch (err) {
        console.error('Failed to load counties:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-gray-600">Loading counties...</div>;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-white"
      >
        <Shield className="w-4 h-4" />
        <span>{selectedCounty || 'Select County'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {counties.map((county) => (
            <button
              key={county.name}
              onClick={() => {
                onSelectCounty(county.name, county.county_name);
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-gray-800">{county.county_name}</div>
              <div className="text-sm text-gray-500">{county.login_username}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
