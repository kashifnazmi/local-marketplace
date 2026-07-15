import { NavLink } from "react-router-dom";

const Sidebar = ({ links }) => {
  return (
    <aside className="w-60 shrink-0 bg-white border-r min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
