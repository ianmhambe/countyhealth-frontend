import React from "react";

export default function DashboardCard({ title, description, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-300 p-6 group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
            <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
