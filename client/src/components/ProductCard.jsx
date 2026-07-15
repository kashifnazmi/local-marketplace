import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import useAuth from "../hooks/useAuth";

const fallbackImage =
  "https://placehold.co/600x450?text=No+Image";

const ProductCard = ({
  product,
  initialWishlisted = false,
  onWishlistChange,
  animationDelay = 0,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] =
    useState(initialWishlisted);

  const [
    wishlistLoading,
    setWishlistLoading,
  ] = useState(false);

  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  useEffect(() => {
    const checkWishlist = async () => {
      if (
        !product?._id ||
        !user ||
        user.role !== "customer" ||
        initialWishlisted
      ) {
        return;
      }

      try {
        const response = await api.get(
          `/customer/wishlist/check/${product._id}`
        );

        setIsWishlisted(
          Boolean(response.data.isWishlisted)
        );
      } catch {
        setIsWishlisted(false);
      }
    };

    checkWishlist();
  }, [
    product?._id,
    user,
    initialWishlisted,
  ]);

  if (!product) {
    return null;
  }

  const productName =
    product.productName ||
    "Unnamed Product";

  const categoryName =
    product.category?.name ||
    "General";

  const storeName =
    product.store?.storeName ||
    "Local Store";

  const imageUrl =
    product.productImage ||
    fallbackImage;

  const price = Number(
    product.price || 0
  );

  const stockQuantity = Number(
    product.stockQuantity || 0
  );

  const handleWishlist = async (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error(
        "Please login as a customer to use wishlist"
      );

      navigate("/login");
      return;
    }

    if (user.role !== "customer") {
      toast.error(
        "Wishlist is available only for customers"
      );
      return;
    }

    if (wishlistLoading) {
      return;
    }

    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(
          `/customer/wishlist/${product._id}`
        );

        setIsWishlisted(false);

        toast.success(
          "Removed from wishlist"
        );

        onWishlistChange?.(
          product._id,
          false
        );
      } else {
        await api.post(
          `/customer/wishlist/${product._id}`
        );

        setIsWishlisted(true);

        toast.success(
          "Added to wishlist"
        );

        onWishlistChange?.(
          product._id,
          true
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Wishlist action failed";

      if (
        message
          .toLowerCase()
          .includes("already")
      ) {
        setIsWishlisted(true);
      }

      toast.error(message);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <article
      className="animate-card hover-lift group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <button
        type="button"
        onClick={handleWishlist}
        disabled={wishlistLoading}
        className={`absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border text-xl shadow-md backdrop-blur-md transition duration-200 ${
          isWishlisted
            ? "border-red-200 bg-red-50/95 text-red-500 dark:border-red-900 dark:bg-red-950/90"
            : "border-gray-200 bg-white/90 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:border-red-900 dark:hover:bg-red-950/50"
        } ${
          wishlistLoading
            ? "cursor-wait opacity-60"
            : ""
        }`}
        title={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        aria-label={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        {wishlistLoading
          ? (
            <span className="animate-pulse text-sm">
              •••
            </span>
          )
          : isWishlisted
            ? "♥"
            : "♡"}
      </button>

      <Link
        to={`/products/${product._id}`}
        className="flex h-full flex-col"
      >
        <div className="image-zoom relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {!imageLoaded && (
            <div className="skeleton absolute inset-0" />
          )}

          <img
            src={imageUrl}
            alt={productName}
            loading="lazy"
            onLoad={() =>
              setImageLoaded(true)
            }
            onError={(event) => {
              event.currentTarget.src =
                fallbackImage;

              setImageLoaded(true);
            }}
            className={`h-full w-full object-cover transition duration-500 ${
              imageLoaded
                ? "opacity-100"
                : "opacity-0"
            }`}
          />

          {stockQuantity <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/55">
              <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow">
                Out of Stock
              </span>
            </div>
          )}

          {product.returnEligible && (
            <span className="absolute bottom-3 left-3 rounded-full bg-green-600/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur">
              Return Eligible
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary-600">
            {categoryName}
          </p>

          <h3 className="mt-2 line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-gray-900 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-500">
            {productName}
          </h3>

          <p className="mt-2 truncate text-xs text-gray-500 dark:text-gray-400">
            🏪 {storeName}
          </p>

          <div className="mt-auto pt-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
                  ₹
                  {price.toLocaleString(
                    "en-IN"
                  )}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    stockQuantity > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500"
                  }`}
                >
                  {stockQuantity > 0
                    ? `${stockQuantity} in stock`
                    : "Out of stock"}
                </p>
              </div>

              <span className="shrink-0 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition duration-200 group-hover:bg-primary-600 group-hover:text-white dark:bg-gray-800 dark:text-primary-500">
                View
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;