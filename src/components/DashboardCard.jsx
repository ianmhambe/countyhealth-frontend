import { motion } from 'framer-motion';

export default function DashboardCard({ title, description, icon: Icon, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-gray-100 hover:border-blue-600 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
          <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <span className="text-sm font-medium text-blue-600 group-hover:underline">
            Open Dashboard →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
