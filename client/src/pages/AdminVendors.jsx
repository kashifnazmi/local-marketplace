import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadVendors = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/vendors");
      setVendors(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load vendor applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAction = async (vendorId, action) => {
    const actionLabel =
      action === "approve" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Do you want to ${actionLabel} this vendor?`
    );

    if (!confirmed) {
      return;
    }

    setActionId(vendorId);

    try {
      await api.put(
        `/admin/vendors/${vendorId}/${action}`
      );

      toast.success(
        action === "approve"
          ? "Vendor approved successfully"
          : "Vendor rejected successfully"
      );

      await loadVendors();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Vendor action failed"
      );
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const pendingCount = vendors.filter(
    (vendor) => vendor.status === "pending"
  ).length;

  return (
    <main className="min-w-0">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
            Vendor Management
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Vendor Applications
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Review and manage marketplace vendor applications.
          </p>
        </div>

        <div className="w-fit rounded-full bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
          {pendingCount} pending
        </div>
      </div>

      {vendors.length === 0 ? (
        <EmptyState message="No vendor applications yet." />
      ) : (
        <>
          {/* Mobile cards */}
          <section className="grid grid-cols-1 gap-4 lg:hidden">
            {vendors.map((vendor, index) => (
              <article
                key={vendor._id}
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
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-700 dark:bg-gray-800 dark:text-primary-500">
                      {vendor.user?.name
                        ?.charAt(0)
                        .toUpperCase() || "V"}
                    </div>

                    <h2 className="mt-3 truncate font-semibold text-gray-900 dark:text-white">
                      {vendor.user?.name || "Unknown Vendor"}
                    </h2>

                    <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                      {vendor.user?.email || "No email"}
                    </p>

                    {vendor.user?.phone && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        📞 {vendor.user.phone}
                      </p>
                    )}
                  </div>

                  <StatusBadge status={vendor.status} />
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  {vendor.status === "pending" ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={actionId === vendor._id}
                        onClick={() =>
                          handleAction(
                            vendor._id,
                            "approve"
                          )
                        }
                        className="w-full rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50 dark:bg-green-950/40 dark:text-green-400"
                      >
                        {actionId === vendor._id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={actionId === vendor._id}
                        onClick={() =>
                          handleAction(
                            vendor._id,
                            "reject"
                          )
                        }
                        className="w-full rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No action available
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* Desktop table */}
          <section className="responsive-table-wrapper hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:block">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 font-bold text-primary-700 dark:bg-gray-800 dark:text-primary-500">
                          {vendor.user?.name
                            ?.charAt(0)
                            .toUpperCase() || "V"}
                        </div>

                        <span className="font-medium text-gray-900 dark:text-white">
                          {vendor.user?.name ||
                            "Unknown Vendor"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {vendor.user?.email || "-"}
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {vendor.user?.phone || "-"}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={vendor.status} />
                    </td>

                    <td className="p-4">
                      {vendor.status === "pending" ? (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            disabled={
                              actionId === vendor._id
                            }
                            onClick={() =>
                              handleAction(
                                vendor._id,
                                "approve"
                              )
                            }
                            className="font-medium text-green-600 hover:underline disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={
                              actionId === vendor._id
                            }
                            onClick={() =>
                              handleAction(
                                vendor._id,
                                "reject"
                              )
                            }
                            className="font-medium text-red-500 hover:underline disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          No action
                        </span>
                      )}
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

export default AdminVendors;