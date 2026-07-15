import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import NotFound from "./pages/NotFound";

import VendorLayout from "./pages/VendorLayout";
import VendorStore from "./pages/VendorStore";
import VendorProducts from "./pages/VendorProducts";
import VendorOrders from "./pages/VendorOrders";

import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVendors from "./pages/AdminVendors";
import AdminStores from "./pages/AdminStores";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-gray-950 dark:text-gray-100">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,

          style: {
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
          },

          success: {
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },

          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <Navbar />

      <div
        key={location.pathname}
        className="page-enter flex-1"
      >
        <Routes>
          {/* Public routes */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/stores/:id"
            element={<StoreDetail />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetail />}
          />

          {/* Logged-in profile */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Customer routes */}

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute
                allowedRoles={["customer"]}
              >
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute
                allowedRoles={["customer"]}
              >
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute
                allowedRoles={["customer"]}
              >
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute
                allowedRoles={["customer"]}
              >
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Vendor routes */}

          <Route
            path="/vendor"
            element={
              <ProtectedRoute
                allowedRoles={["vendor"]}
              >
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<VendorStore />}
            />

            <Route
              path="products"
              element={<VendorProducts />}
            />

            <Route
              path="orders"
              element={<VendorOrders />}
            />
          </Route>

          {/* Admin routes */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="vendors"
              element={<AdminVendors />}
            />

            <Route
              path="stores"
              element={<AdminStores />}
            />

            <Route
              path="products"
              element={<AdminProducts />}
            />

            <Route
              path="orders"
              element={<AdminOrders />}
            />
          </Route>

          {/* 404 route */}

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;