import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Building, MapPin, FileText, Edit2, Save, X, Lock as LockIcon } from "lucide-react";

// --- Reusable Input Components ---

const ProfileInput = ({ icon, label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        {...props}
        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed ${props.className}`}
      />
    </div>
  </div>
);

const ProfileTextarea = ({ icon, label, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute top-3 left-0 pl-4 pointer-events-none">
        {icon}
      </div>
      <textarea
        {...props}
        rows={4}
        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
);

// --- View Mode Component (Card) ---

const ProfileCard = ({ profile, status, onEdit }) => (
  <div className="max-w-3xl bg-white rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-300">
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">{profile.companyName}</h2>
          </div>
          {profile.location && (
            <div className="flex items-center gap-2 text-white/90 mt-1">
              <MapPin size={16} />
              <span className="font-medium">{profile.location}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status === 'approved' ? 'bg-green-100 text-green-800' :
            status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
            {status}
          </span>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition backdrop-blur-sm"
          >
            <Edit2 size={16} /> Edit Profile
          </button>
        </div>
      </div>
    </div>

    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">About Company</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {profile.description || "No description provided."}
        </p>
      </div>

      {/* Fallback if location isn't in header */}
      {!profile.location && (
        <p className="text-gray-400 text-sm italic">Location not specified.</p>
      )}
    </div>
  </div>
);


// --- Main Profile Component ---

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    companyName: "",
    location: "",
    description: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch recruiter profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/recruiters/profile");
      if (res.data) {
        setProfile({
          companyName: res.data.companyName || "",
          location: res.data.location || "",
          description: res.data.description || "",
        });
        setStatus(res.data.status);
        setIsEditing(false); // Default to view mode if profile exists
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // No profile yet, allow creating one
        setStatus("new");
        setIsEditing(true); // Default to edit mode for new users
      } else {
        console.error("Failed to fetch profile", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/recruiters/profile", profile);
      // Refresh data and switch to view mode
      await fetchProfile();
      alert("Profile saved successfully");
    } catch {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;

  return (
    <div className="p-1">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isEditing && status === 'new' ? 'Create Profile' : 'Recruiter Profile'}
      </h1>

      {!isEditing ? (
        <ProfileCard profile={profile} status={status} onEdit={() => setIsEditing(true)} />
      ) : (
        <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-md animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-700">
              {status === 'new' ? 'Setup Your Company Profile' : 'Edit Company Details'}
            </h2>
            {status !== 'new' && (
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfileInput
              label="Company Name"
              name="companyName"
              placeholder="Enter company name"
              value={profile.companyName}
              onChange={handleChange}
              icon={status !== "new" ? <LockIcon size={18} className="text-gray-400" /> : <Building size={18} className="text-gray-400" />}
              required
              disabled={status !== "new"} // Disable if not new
              title={status !== "new" ? "Company name cannot be changed once set" : ""}
            />

            <ProfileInput
              label="Location"
              name="location"
              placeholder="City, Country or Remote"
              value={profile.location}
              onChange={handleChange}
              icon={<MapPin size={18} className="text-gray-400" />}
            />

            <ProfileTextarea
              label="Company Description"
              name="description"
              placeholder="Short description about the company"
              value={profile.description}
              onChange={handleChange}
              icon={<FileText size={18} className="text-gray-400" />}
            />

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold
                hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {status !== 'new' && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold
                  hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
