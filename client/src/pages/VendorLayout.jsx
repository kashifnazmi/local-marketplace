import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const links = [
  { to: "/vendor", label: "🏪 My Store", end: true },
  { to: "/vendor/products", label: "📦 Products" },
  { to: "/vendor/orders", label: "🧾 Orders" },
];

const VendorLayout = () => (
  <div className="flex">
    <Sidebar links={links} />
    <div className="flex-1 p-6">
      <Outlet />
    </div>
  </div>
);

export default VendorLayout;
