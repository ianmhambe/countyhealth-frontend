import { Activity, Calendar, FileText, UserPlus, Users } from "lucide-react";

export default function Sidebar({ activeItem, onSelect }) {
  const menuItems = [
    { key: "visits", label: "Visits", icon: Activity },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "encounters", label: "Encounters", icon: FileText },
    { key: "enrollment", label: "Enrollment", icon: UserPlus },
    { key: "patients", label: "Patients", icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Dashboards</h2>
      <ul className="space-y-2">
        {menuItems.map(({ key, label, icon: Icon }) => (
          <li key={key}>
            <button
              onClick={() => onSelect(key)}
              className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition 
                ${
                  activeItem === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
