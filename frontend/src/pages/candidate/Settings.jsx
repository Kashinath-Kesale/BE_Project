import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../services/api.js";

export default function Settings() {
    const navigate = useNavigate();
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);


    const handleChangePassword = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!oldPass || !newPass || !confirmPass) {
            toast.warn("Please fill in all password fields.");
            return;
        }
        if (newPass !== confirmPass) {
            toast.error("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/change-password", { oldPassword: oldPass, newPassword: newPass });
            toast.success("Password changed successfully!");
            setOldPass("");
            setNewPass("");
            setConfirmPass("");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.info("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="bg-gray-50 w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your account and security settings.</p>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">
                            Don't remember your current password?
                        </p>
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                            Reset your password via email →
                        </Link>
                    </div>

                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="oldPass" className="block text-sm font-medium text-gray-700 mb-1">
                                    Old Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="oldPass"
                                        type={showOldPass ? "text" : "password"}
                                        value={oldPass}
                                        onChange={(e) => setOldPass(e.target.value)}
                                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                        placeholder="Enter your current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPass(!showOldPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showOldPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="newPass" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="newPass"
                                        type={showNewPass ? "text" : "password"}
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                        placeholder="Enter a strong new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPass"
                                        type={showConfirmPass ? "text" : "password"}
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                                        placeholder="Confirm your new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                {loading ? "Saving..." : "Change Password"}
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Logout
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

