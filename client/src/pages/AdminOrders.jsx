import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      try {
        const response = await api.get("/admin/orders");
        setOrders(response.data.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getOrderTotal = (order) => {
    return Number(
      order.orderTotal ??
        order.totalAmount ??
        order.grandTotal ??
        order.totalPrice ??
        order.amount ??
        0
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="min-w-0">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
          Order Management
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          All Orders
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          View marketplace orders from all stores.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <>
          {/* Mobile cards */}
          <section className="grid grid-cols-1 gap-4 lg:hidden">
            {orders.map((order, index) => (
              <article
                key={order._id}
                className="animate-card hover-lift rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                style={{
                  animationDelay: `${Math.min(
                    index * 70,
                    420
                  )}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                      {order.customer?.name ||
                        "Unknown Customer"}
                    </h2>

                    <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                      {order.customer?.email || "-"}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800">
                  <div>
                    <p className="text-xs text-gray-400">
                      Store
                    </p>

                    <p className="mt-1 font-medium text-gray-700 dark:text-gray-200">
                      {order.store?.storeName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">
                      Total
                    </p>

                    <p className="mt-1 font-bold text-gray-900 dark:text-white">
                      ₹
                      {getOrderTotal(
                        order
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">
                      Date
                    </p>

                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* Desktop table */}
          <section className="responsive-table-wrapper hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
            <table className="w-full min-w-[850px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.customer?.name || "-"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {order.customer?.email || ""}
                      </p>
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {order.store?.storeName || "-"}
                    </td>

                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      ₹
                      {getOrderTotal(
                        order
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
};

export default AdminOrders;