import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const nextStatusOptions = {
  pending: ["accepted", "rejected"],
  accepted: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  rejected: [],
  cancelled: [],
};

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const response = await api.get("/vendor/orders");
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

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    const confirmed = window.confirm(
      `Change order status to "${status}"?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(orderId);

    try {
      await api.put(`/vendor/orders/${orderId}`, {
        status,
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update order"
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
          Incoming Orders
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review incoming orders and update their status.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <section className="space-y-5">
          {orders.map((order, index) => {
            const availableStatuses =
              nextStatusOptions[
                String(order.status).toLowerCase()
              ] || [];

            return (
              <article
                key={order._id}
                className="animate-card hover-lift overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                style={{
                  animationDelay: `${Math.min(
                    index * 80,
                    400
                  )}ms`,
                }}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {order.customer?.name ||
                        "Unknown Customer"}
                    </h2>

                    <p className="mt-1 break-all text-xs text-gray-400">
                      {order.customer?.email || "-"}
                    </p>

                    {order.customer?.phone && (
                      <p className="mt-1 text-xs text-gray-400">
                        📞 {order.customer.phone}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                <div className="border-y border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-800/50 sm:px-5">
                  {order.items?.length > 0 ? (
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={
                            item._id ||
                            `${item.productName}-${item.quantity}`
                          }
                          className="flex items-start justify-between gap-4 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="line-clamp-2 font-medium text-gray-700 dark:text-gray-200">
                              {item.productName ||
                                item.product?.productName ||
                                "Product"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <span className="shrink-0 font-medium text-gray-900 dark:text-white">
                            ₹
                            {Number(
                              item.price * item.quantity
                            ).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No order items available.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <p className="text-xs text-gray-400">
                      Order Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      ₹
                      {getOrderTotal(
                        order
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {availableStatuses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={
                            updatingId === order._id
                          }
                          onClick={() =>
                            updateStatus(
                              order._id,
                              status
                            )
                          }
                          className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition disabled:opacity-50 ${
                            status === "rejected" ||
                            status === "cancelled"
                              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                              : status === "delivered"
                                ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400"
                                : "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-gray-800 dark:text-primary-500"
                          }`}
                        >
                          {updatingId === order._id
                            ? "Updating..."
                            : status}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No further action available
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default VendorOrders;