import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) return "Name is required";
    if (!emailRegex.test(form.email)) return "Invalid email format";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      const data = await register(form);
      toast.success(
        form.role === "vendor" ? "Registered! Awaiting admin approval." : "Registered successfully!"
      );
      if (form.role === "vendor") navigate("/login");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl border shadow-sm">
      <h1 className="text-2xl font-bold mb-1">Create account</h1>
      <p className="text-sm text-gray-400 mb-6">Join the local marketplace</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">I am a</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          >
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <input name="name" required value={form.name} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" name="password" required value={form.password} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="text-sm text-gray-400 mt-4 text-center">
        Already have an account? <Link to="/login" className="text-primary-600 font-medium">Login</Link>
      </p>
    </div>
  );
};

export default Register;
