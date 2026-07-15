import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const loadStores = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/stores");
      setStores(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load stores"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleToggle = async (store) => {
    const nextAction = store.isActive
      ? "disable"
      : "enable";

    const confirmed = window.confirm(
      `Do you want to ${nextAction} ${store.storeName}?`
    );

    if (!confirmed) {
      return;
    }

    setTogglingId(store._id);

    try {
      await api.put(
        `/admin/stores/${store._id}/toggle`
      );

      setStores((previousStores) =>
        previousStores.map((item) =>
          item._id === store._id
            ? {
                ...item,
                isActive: !item.isActive,
              }
            : item
        )
      );

      toast.success("Store status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update store"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const getCategoryNames = (store) => {
    if (store.categories?.length > 0) {
      return store.categories
        .map((category) => category.name)
        .join(", ");
    }

    if (store.category?.name) {
      return store.category.name;
    }

    return "General";
  };

  if (loading) {
    return <Loader />;
  }

  const activeCount = stores.filter(
    (store) => store.isActive
  ).length;

  return (
    <main className="min-w-0">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Store Management
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            All Stores
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enable, disable and review marketplace stores.
          </p>
        </div>

        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-green-50 px-4 py-2 font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
            {activeCount} active
          </span>

          <span className="rounded-full bg-red-50 px-4 py-2 font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {stores.length - activeCount} disabled
          </span>
        </div>
      </div>

      {stores.length === 0 ? (
        <EmptyState message="No stores yet." />
      ) : (
        <>
          {/* Mobile cards */}
          <section className="grid grid-cols-1 gap-4 lg:hidden">
            {stores.map((store, index) => (
              <article
                key={store._id}
                className="animate-card hover-lift rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                style={{
                  animationDelay: `${Math.min(
                    index * 80,
                    400
                  )}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                      {store.storeName}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Vendor:{" "}
                      {store.vendor?.name || "Unknown"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      store.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {store.isActive
                      ? "Active"
                      : "Disabled"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      Categories:
                    </span>{" "}
                    {getCategoryNames(store)}
                  </p>

                  <p>
                    📍 {store.address || "No address"}
                  </p>

                  {store.contactNumber && (
                    <p>📞 {store.contactNumber}</p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={togglingId === store._id}
                  onClick={() => handleToggle(store)}
                  className={`mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                    store.isActive
                      ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                      : "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400"
                  }`}
                >
                  {togglingId === store._id
                    ? "Updating..."
                    : store.isActive
                      ? "Disable Store"
                      : "Enable Store"}
                </button>
              </article>
            ))}
          </section>

          {/* Desktop table */}
          <section className="responsive-table-wrapper hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-4">Store</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Categories</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {stores.map((store) => (
                  <tr
                    key={store._id}
                    className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {store.storeName}
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {store.vendor?.name || "-"}
                    </td>

                    <td className="max-w-[230px] p-4 text-gray-500 dark:text-gray-400">
                      <p className="line-clamp-2">
                        {getCategoryNames(store)}
                      </p>
                    </td>

                    <td className="max-w-[230px] p-4 text-gray-500 dark:text-gray-400">
                      <p className="line-clamp-2">
                        {store.address || "-"}
                      </p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          store.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                        {store.isActive
                          ? "Active"
                          : "Disabled"}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        disabled={
                          togglingId === store._id
                        }
                        onClick={() =>
                          handleToggle(store)
                        }
                        className="font-medium text-primary-600 hover:underline disabled:opacity-50"
                      >
                        {togglingId === store._id
                          ? "Updating..."
                          : store.isActive
                            ? "Disable"
                            : "Enable"}
                      </button>
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

export default AdminStores;