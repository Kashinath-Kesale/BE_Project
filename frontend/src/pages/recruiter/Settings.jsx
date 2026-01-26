import React, { useState } from "react";

// In a real app, you would use your actual API service
// FAKE API for demonstration
const api = {
    post: (url, data) => {
        return new Promise((resolve, reject) => {
            console.log("Mock API Call:", url, data);
            setTimeout(() => {
                // Mocking a successful password change for demonstration
                if (data.oldPassword) {
                    resolve({ data: { message: "Password changed successfully" } });
                } else {
                    reject({ response: { data: { message: "An error occurred" } } });
                }
            }, 1000);
        });
    }
};

// You would use your router's navigation hook, e.g., from 'react-router-dom'
// FAKE NAV for demonstration
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);


export default function RecruiterSettings() {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);
    
    const nav = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPass || !newPass || !confirmPass) {
            alert("Please fill in all password fields.");
            return;
        }
        if (newPass !== confirmPass) {
            alert("New passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/change-password", { oldPassword: oldPass, newPassword: newPass });
            alert("Password changed successfully!");
            // Clear fields on success
            setOldPass("");
            setNewPass("");
            setConfirmPass("");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // In a real app, you'd clear user state/context and tokens
        console.log("Recruiter logged out.");
        nav("/recruiter/login");
    };

    return (
        <div className="bg-gray-50 w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-6">
                             <div>
                                 <label htmlFor="oldPass" className="block text-sm font-medium text-gray-700 mb-1">
                                     Current Password
                                 </label>
                                 <input
                                     id="oldPass"
                                     type="password"
                                     value={oldPass}
                                     onChange={(e) => setOldPass(e.target.value)}
                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                     placeholder="Enter your current password"
                                 />
                             </div>
                             <div>
                                 <label htmlFor="newPass" className="block text-sm font-medium text-gray-700 mb-1">
                                     New Password
                                 </label>
                                 <input
                                     id="newPass"
                                     type="password"
                                     value={newPass}
                                     onChange={(e) => setNewPass(e.target.value)}
                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                     placeholder="Enter a strong new password"
                                 />
                             </div>
                             <div>
                                 <label htmlFor="confirmPass" className="block text-sm font-medium text-gray-700 mb-1">
                                     Confirm New Password
                                 </label>
                                 <input
                                     id="confirmPass"
                                     type="password"
                                     value={confirmPass}
                                     onChange={(e) => setConfirmPass(e.target.value)}
                                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                     placeholder="Confirm your new password"
                                 />
                             </div>
                        </div>

                        {/* Actions Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Update Password"}
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300"
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