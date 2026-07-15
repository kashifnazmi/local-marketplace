import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/customer/wishlist");

      setWishlistItems(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load wishlist"
      );

      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleProductRemoved = (productId) => {
    setWishlistItems((previousItems) =>
      previousItems.filter(
        (item) => item.product?._id !== productId
      )
    );
  };

  const handleClearWishlist = async () => {
    const confirmed = window.confirm(
      "Do you want to remove all products from your wishlist?"
    );

    if (!confirmed) {
      return;
    }

    setClearing(true);

    try {
      await api.delete("/customer/wishlist");

      setWishlistItems([]);
      toast.success("Wishlist cleared successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to clear wishlist"
      );
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 transition-colors dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              Saved Products
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
              My Wishlist
            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1
                ? "product"
                : "products"}{" "}
              saved
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={handleClearWishlist}
              disabled={clearing}
              className="w-fit rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
            >
              {clearing
                ? "Clearing..."
                : "Clear Wishlist"}
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <EmptyState message="Your wishlist is empty." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {wishlistItems.map((item) => {
              if (!item.product) {
                return null;
              }

              return (
                <ProductCard
                  key={item._id}
                  product={item.product}
                  initialWishlisted
                  onWishlistChange={
                    handleProductRemoved
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;