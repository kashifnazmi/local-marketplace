import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const fallbackImage =
  "https://placehold.co/300x300?text=No+Image";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/products");
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.productName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(product._id);

    try {
      await api.delete(
        `/admin/products/${product._id}`
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) => item._id !== product._id
        )
      );

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="min-w-0">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
          Product Management
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
          All Products
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review and remove products from the marketplace.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState message="No products yet." />
      ) : (
        <>
          {/* Mobile cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {products.map((product, index) => (
              <article
                key={product._id}
                className="animate-card hover-lift overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                style={{
                  animationDelay: `${Math.min(
                    index * 70,
                    420
                  )}ms`,
                }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={
                      product.productImage ||
                      fallbackImage
                    }
                    alt={product.productName}
                    onError={(event) => {
                      event.currentTarget.src =
                        fallbackImage;
                    }}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
                    {product.category?.name ||
                      "General"}
                  </p>

                  <h2 className="mt-2 line-clamp-2 font-semibold text-gray-900 dark:text-white">
                    {product.productName}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    🏪{" "}
                    {product.store?.storeName ||
                      "Unknown Store"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹
                        {Number(
                          product.price || 0
                        ).toLocaleString("en-IN")}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          Number(
                            product.stockQuantity
                          ) > 0
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        Stock: {product.stockQuantity}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        deletingId === product._id
                      }
                      onClick={() =>
                        handleDelete(product)
                      }
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400"
                    >
                      {deletingId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
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
                  <th className="p-4">Product</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-t border-gray-200 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.productImage ||
                            fallbackImage
                          }
                          alt={product.productName}
                          onError={(event) => {
                            event.currentTarget.src =
                              fallbackImage;
                          }}
                          className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />

                        <span className="max-w-[260px] truncate font-medium text-gray-900 dark:text-white">
                          {product.productName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {product.store?.storeName || "-"}
                    </td>

                    <td className="p-4 text-gray-500 dark:text-gray-400">
                      {product.category?.name || "-"}
                    </td>

                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          Number(product.stockQuantity) > 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-500"
                        }
                      >
                        {product.stockQuantity}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        disabled={
                          deletingId === product._id
                        }
                        onClick={() =>
                          handleDelete(product)
                        }
                        className="font-medium text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deletingId === product._id
                          ? "Deleting..."
                          : "Delete"}
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

export default AdminProducts;