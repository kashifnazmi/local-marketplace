import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const desktopLinkClass = ({
    isActive,
  }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-500"
        : "text-gray-600 hover:bg-gray-100 hover:text-primary-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary-500"
    }`;

  const mobileLinkClass = ({
    isActive,
  }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-primary-50 text-primary-700 dark:bg-gray-800 dark:text-primary-500"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md transition-colors dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold text-primary-600 sm:text-xl"
        >
          <span className="text-2xl">
            🛍️
          </span>

          <span className="hidden sm:inline">
            Local Marketplace
          </span>

          <span className="sm:hidden">
            Local Market
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            className={desktopLinkClass}
          >
            Home
          </NavLink>

          {!user && (
            <>
              <NavLink
                to="/login"
                className={desktopLinkClass}
              >
                Login
              </NavLink>

              <Link
                to="/register"
                className="ml-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
              >
                Register
              </Link>
            </>
          )}

          {user?.role === "customer" && (
            <>
              <NavLink
                to="/wishlist"
                className={desktopLinkClass}
              >
                Wishlist
              </NavLink>

              <NavLink
                to="/cart"
                className={desktopLinkClass}
              >
                Cart
              </NavLink>

              <NavLink
                to="/orders"
                className={desktopLinkClass}
              >
                Orders
              </NavLink>

              <NavLink
                to="/profile"
                className={desktopLinkClass}
              >
                Profile
              </NavLink>
            </>
          )}

          {user?.role === "vendor" && (
            <NavLink
              to="/vendor"
              className={desktopLinkClass}
            >
              Vendor Panel
            </NavLink>
          )}

          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={desktopLinkClass}
            >
              Admin Panel
            </NavLink>
          )}

          {user && (
            <>
              <div className="mx-2 hidden text-right lg:block">
                <p className="max-w-[130px] truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.name}
                </p>

                <p className="text-xs capitalize text-primary-600">
                  {user.role}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          )}

          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (previous) => !previous
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-xl text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg md:hidden dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <NavLink
              to="/"
              className={mobileLinkClass}
            >
              Home
            </NavLink>

            {!user && (
              <>
                <NavLink
                  to="/login"
                  className={mobileLinkClass}
                >
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}

            {user?.role === "customer" && (
              <>
                <NavLink
                  to="/wishlist"
                  className={mobileLinkClass}
                >
                  Wishlist
                </NavLink>

                <NavLink
                  to="/cart"
                  className={mobileLinkClass}
                >
                  Cart
                </NavLink>

                <NavLink
                  to="/orders"
                  className={mobileLinkClass}
                >
                  Orders
                </NavLink>

                <NavLink
                  to="/profile"
                  className={mobileLinkClass}
                >
                  Profile
                </NavLink>
              </>
            )}

            {user?.role === "vendor" && (
              <NavLink
                to="/vendor"
                className={mobileLinkClass}
              >
                Vendor Panel
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={mobileLinkClass}
              >
                Admin Panel
              </NavLink>
            )}

            {user && (
              <>
                <div className="mt-2 border-t border-gray-200 px-4 pt-4 dark:border-gray-700">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {user.name}
                  </p>

                  <p className="text-xs capitalize text-primary-600">
                    {user.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg bg-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;