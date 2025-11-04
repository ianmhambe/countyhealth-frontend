import React from "react";
import { LogOut } from "lucide-react";

export default function Sidebar({ countyName, dashboardUrl, onLogout }) {
  return (
    <aside className="w-64 bg-white shadow px-4 py-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mb-2">{countyName} Dashboard</h2>

        <nav className="space-y-3 mt-6">
          <button className="w-full text-left px-3 py-2 bg-blue-100 rounded">
            County Dashboard
          </button>

          <a
            href={dashboardUrl || "#"}
            target="_blank"
            className="block px-3 py-2 bg-gray-200 rounded"
          >
            Open Dashboard in New Tab
          </a>
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 text-red-600 mt-6"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
