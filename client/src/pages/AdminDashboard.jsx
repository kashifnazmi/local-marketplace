import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../services/api";
import Loader from "../components/Loader";
import DashboardCard from "../components/DashboardCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const overviewData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        name: "Customers",
        total: Number(stats.totalCustomers || 0),
      },
      {
        name: "Vendors",
        total: Number(stats.totalVendors || 0),
      },
      {
        name: "Stores",
        total: Number(stats.totalStores || 0),
      },
      {
        name: "Products",
        total: Number(stats.totalProducts || 0),
      },
      {
        name: "Orders",
        total: Number(stats.totalOrders || 0),
      },
    ];
  }, [stats]);

  const marketplaceDistribution = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        name: "Customers",
        value: Number(stats.totalCustomers || 0),
      },
      {
        name: "Vendors",
        value: Number(stats.totalVendors || 0),
      },
      {
        name: "Stores",
        value: Number(stats.totalStores || 0),
      },
      {
        name: "Products",
        value: Number(stats.totalProducts || 0),
      },
      {
        name: "Orders",
        value: Number(stats.totalOrders || 0),
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const orderStatusData = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      {
        name: "Pending",
        value: Number(
          stats.pendingOrders ||
            stats.orderStatus?.pending ||
            0
        ),
      },
      {
        name: "Confirmed",
        value: Number(
          stats.confirmedOrders ||
            stats.orderStatus?.confirmed ||
            0
        ),
      },
      {
        name: "Shipped",
        value: Number(
          stats.shippedOrders ||
            stats.orderStatus?.shipped ||
            0
        ),
      },
      {
        name: "Delivered",
        value: Number(
          stats.deliveredOrders ||
            stats.orderStatus?.delivered ||
            0
        ),
      },
      {
        name: "Cancelled",
        value: Number(
          stats.cancelledOrders ||
            stats.orderStatus?.cancelled ||
            0
        ),
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const tooltipStyle = {
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "13px",
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">
          Dashboard data is unavailable.
        </p>
      </div>
    );
  }

  return (
    <main className="min-w-0">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
          Marketplace Overview
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Monitor customers, vendors, stores, products and orders.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <DashboardCard
          icon="👥"
          label="Total Customers"
          value={stats.totalCustomers || 0}
        />

        <DashboardCard
          icon="🧑‍💼"
          label="Total Vendors"
          value={stats.totalVendors || 0}
        />

        <DashboardCard
          icon="🏪"
          label="Total Stores"
          value={stats.totalStores || 0}
        />

        <DashboardCard
          icon="📦"
          label="Total Products"
          value={stats.totalProducts || 0}
        />

        <DashboardCard
          icon="🧾"
          label="Total Orders"
          value={stats.totalOrders || 0}
        />
      </section>

      <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Marketplace Statistics
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overall count of marketplace records.
            </p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={overviewData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                  }}
                  interval={0}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    Number(value).toLocaleString("en-IN"),
                    "Total",
                  ]}
                />

                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#3b6fed"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Marketplace Distribution
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Relative distribution of current marketplace records.
            </p>
          </div>

          {marketplaceDistribution.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center">
              <p className="text-sm text-gray-400">
                No data available for this chart.
              </p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={marketplaceDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(
                        percent * 100
                      ).toFixed(0)}%`
                    }
                  >
                    {marketplaceDistribution.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            [
                              "#3b6fed",
                              "#8b5cf6",
                              "#14b8a6",
                              "#f59e0b",
                              "#ef4444",
                            ][index % 5]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      Number(value).toLocaleString(
                        "en-IN"
                      ),
                      "Total",
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section className="mt-6">
        <article className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Orders by Status
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Distribution of pending, confirmed, shipped,
              delivered and cancelled orders.
            </p>
          </div>

          {orderStatusData.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 text-center dark:border-gray-700 dark:bg-gray-800">
              <span className="text-4xl">📊</span>

              <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
                Order status analytics are not available yet
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Your current dashboard API only returns total
                orders. The backend dashboard controller must also
                return pending, confirmed, shipped, delivered and
                cancelled order counts.
              </p>
            </div>
          ) : (
            <div className="h-[340px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={orderStatusData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 25,
                    left: 15,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={85}
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [
                      Number(value).toLocaleString(
                        "en-IN"
                      ),
                      "Orders",
                    ]}
                  />

                  <Bar
                    dataKey="value"
                    name="Orders"
                    fill="#3b6fed"
                    radius={[0, 8, 8, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>
    </main>
  );
};

export default AdminDashboard;