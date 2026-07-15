import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const links = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/vendors", label: "🧑‍💼 Vendor Approvals" },
  { to: "/admin/stores", label: "🏪 Stores" },
  { to: "/admin/products", label: "📦 Products" },
  { to: "/admin/orders", label: "🧾 Orders" },
];

const AdminLayout = () => (
  <div className="flex">
    <Sidebar links={links} />
    <div className="flex-1 p-6">
      <Outlet />
    </div>
  </div>
);

export default AdminLayout;
