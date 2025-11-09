import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    AlertCircle,
    CheckCircle,
    X,
    Eye,
    EyeOff,
    Shield,
    Building2,
    ExternalLink,
} from "lucide-react";
import api from "../api/apiService";

export default function CountyManagementPage({ user, onLogout, onBackToDashboard }) {
    const [counties, setCounties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
    const [currentCounty, setCurrentCounty] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        county_name: "",
        login_username: "",
        login_password: "",
        dashboard_url: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Load counties
    const loadCounties = async () => {
        setLoading(true);
        try {
            const result = await api.getAllCounties(searchTerm || null, page, 20);
            setCounties(result.counties || []);
            setTotalPages(result.total_pages || 1);
        } catch (error) {
            showNotification("error", error.message || "Failed to load counties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCounties();
    }, [page, searchTerm]);

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: "",
            county_name: "",
            login_username: "",
            login_password: "",
            dashboard_url: "",
        });
        setErrors({});
        setShowPassword(false);
    };

    // Open create modal
    const openCreateModal = () => {
        resetForm();
        setModalMode("create");
        setCurrentCounty(null);
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = async (county) => {
        try {
            const details = await api.getCountyDetails(county.county_id);
            setFormData({
                name: county.county_id || "",
                county_name: details.county_name,
                login_username: details.login_username,
                login_password: "", // Don't load password for security
                dashboard_url: details.dashboard_url,
            });
            setCurrentCounty(county);
            setModalMode("edit");
            setShowModal(true);
            setErrors({});
        } catch (error) {
            showNotification("error", error.message || "Failed to load county details");
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate name field
        if (modalMode === "create" && !formData.name.trim()) {
            newErrors.name = "County ID is required";
        } else if (modalMode === "create" && formData.name.length < 2) {
            newErrors.name = "County ID must be at least 2 characters";
        } else if (modalMode === "create" && !/^[a-zA-Z0-9-_]+$/.test(formData.name)) {
            newErrors.name = "County ID can only contain letters, numbers, hyphens, and underscores";
        }

        if (!formData.county_name.trim()) {
            newErrors.county_name = "County name is required";
        } else if (formData.county_name.length < 2) {
            newErrors.county_name = "County name must be at least 2 characters";
        }

        if (!formData.login_username.trim()) {
            newErrors.login_username = "Username is required";
        } else if (formData.login_username.length < 3) {
            newErrors.login_username = "Username must be at least 3 characters";
        } else if (!/^[a-z0-9_]+$/.test(formData.login_username)) {
            newErrors.login_username = "Username can only contain lowercase letters, numbers, and underscores";
        }

        if (modalMode === "create" && !formData.login_password) {
            newErrors.login_password = "Password is required";
        } else if (formData.login_password && formData.login_password.length < 6) {
            newErrors.login_password = "Password must be at least 6 characters";
        }

        if (!formData.dashboard_url.trim()) {
            newErrors.dashboard_url = "Dashboard URL is required";
        } else if (!formData.dashboard_url.startsWith("http://") &&
            !formData.dashboard_url.startsWith("https://")) {
            newErrors.dashboard_url = "URL must start with http:// or https://";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            if (modalMode === "create") {
                await api.createCounty(formData);
                showNotification("success", "County created successfully");
            } else {
                const updates = { ...formData };
                if (!updates.login_password) {
                    delete updates.login_password; // Don't update password if not provided
                }
                await api.updateCounty(currentCounty.county_id, updates);
                showNotification("success", "County updated successfully");
            }
            setShowModal(false);
            resetForm();
            loadCounties();
        } catch (error) {
            const errorMsg = error.message || "Operation failed";
            setErrors({ submit: errorMsg });
            showNotification("error", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete
    const handleDelete = async (county) => {
        setDeleteConfirm(county);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await api.deleteCounty(deleteConfirm.county_id);
            showNotification("success", "County deleted successfully");
            setDeleteConfirm(null);
            loadCounties();
        } catch (error) {
            showNotification("error", error.message || "Failed to delete county");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-6 h-6 text-blue-600"/>
                        <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
                    </div>
                    <nav className="space-y-2">
                        {/* Back to Dashboard Button */}
                        <button 
                            onClick={onBackToDashboard}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                        >
                            <Eye className="w-4 h-4"/>
                            View Dashboards
                        </button>
                        
                        <button className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                            <Building2 className="w-4 h-4"/>
                            County Management
                        </button>
                    </nav>
                </div>
                
                <div>
                    <div className="text-sm text-gray-500 mb-2">Logged in as</div>
                    <div className="text-sm font-medium text-gray-800 mb-4">Super Admin</div>
                    <button
                        onClick={onLogout}
                        className="w-full text-red-600 hover:text-red-800 text-sm font-medium px-3 py-2 rounded hover:bg-red-50 transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                        notification.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                    }`}>
                        {notification.type === "success" ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(null)} className="ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">County Management</h1>
                            <p className="text-sm text-gray-500">Manage county dashboards and access</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add County
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search counties or usernames..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                    </div>
                </div>

                {/* Counties List */}
                <div className="px-6 pb-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : counties.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No counties found</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-blue-600 hover:underline mt-2"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            County Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dashboard URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Last Modified
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {counties.map((county) => (
                                        <tr key={county.county_id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-800">{county.county_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{county.login_username}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="truncate max-w-xs">{county.dashboard_url}</span>
                                                    <a
                                                        href={county.dashboard_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(county.modified).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(county)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(county)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {modalMode === "create" ? "Add New County" : "Edit County"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name Field - County ID */}
                            {modalMode === "create" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        County ID *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none ${
                                            errors.name ? "border-red-500" : "border-gray-300"
                                        }`}
                                        placeholder="e.g., 001"
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unique identifier for the county (cannot be changed after creation)
                                    </p>
                                </div>
                            )}

                            {/* County Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    County Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.county_name}
                                    onChange={(e) => setFormData({ ...formData, county_name: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none ${
                                        errors.county_name ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="e.g., Nairobi County"
                                />
                                {errors.county_name && (
                                    <p className="text-red-600 text-xs mt-1">{errors.county_name}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Login Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.login_username}
                                    onChange={(e) =>
                                        setFormData({ ...formData, login_username: e.target.value.toLowerCase() })
                                    }
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none ${
                                        errors.login_username ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="e.g., nairobi"
                                />
                                {errors.login_username && (
                                    <p className="text-red-600 text-xs mt-1">{errors.login_username}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Lowercase letters, numbers, and underscores only
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password {modalMode === "create" ? "*" : "(leave blank to keep current)"}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.login_password}
                                        onChange={(e) => setFormData({ ...formData, login_password: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none pr-10 ${
                                            errors.login_password ? "border-red-500" : "border-gray-300"
                                        }`}
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.login_password && (
                                    <p className="text-red-600 text-xs mt-1">{errors.login_password}</p>
                                )}
                            </div>

                            {/* Dashboard URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dashboard URL *
                                </label>
                                <input
                                    type="url"
                                    value={formData.dashboard_url}
                                    onChange={(e) => setFormData({ ...formData, dashboard_url: e.target.value })}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none ${
                                        errors.dashboard_url ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="https://dashboard.example.com"
                                />
                                {errors.dashboard_url && (
                                    <p className="text-red-600 text-xs mt-1">{errors.dashboard_url}</p>
                                )}
                            </div>

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.submit}</span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving..." : modalMode === "create" ? "Create County" : "Update County"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600"/>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Delete County</h3>
                                <p className="text-sm text-gray-600">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <strong>{deleteConfirm.county_name}</strong>? All access
                            for this county will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Delete County
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}