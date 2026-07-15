import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/auth/profile", profile);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl border">
      <h1 className="text-xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input name="name" value={profile.name || ""} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={profile.email || ""} disabled className="w-full mt-1 border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400" />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input name="phone" value={profile.phone || ""} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <input name="address" value={profile.address || ""} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button disabled={saving} className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
