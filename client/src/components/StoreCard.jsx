import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

const fallbackStoreImage =
  "https://placehold.co/800x500?text=Local+Store";

const StoreCard = ({
  store,
  animationDelay = 0,
}) => {
  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);

  if (!store) {
    return null;
  }

  const storeName =
    store.storeName ||
    "Local Store";

  const description =
    store.description ||
    "Explore products available from this local store.";

  const address =
    store.address ||
    "Address not available";

  const contactNumber =
    store.contactNumber ||
    "";

  const storeImage =
    store.banner ||
    store.logo ||
    fallbackStoreImage;

  const categories =
    store.categories?.length > 0
      ? store.categories
      : store.category
        ? [store.category]
        : [];

  return (
    <article
      className="animate-card hover-lift group h-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <Link
        to={`/stores/${store._id}`}
        className="flex h-full flex-col"
      >
        <div className="image-zoom relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {!imageLoaded && (
            <div className="skeleton absolute inset-0" />
          )}

          <img
            src={storeImage}
            alt={storeName}
            loading="lazy"
            onLoad={() =>
              setImageLoaded(true)
            }
            onError={(event) => {
              event.currentTarget.src =
                fallbackStoreImage;

              setImageLoaded(true);
            }}
            className={`h-full w-full object-cover transition duration-500 ${
              imageLoaded
                ? "opacity-100"
                : "opacity-0"
            }`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow backdrop-blur ${
              store.isActive !== false
                ? "bg-green-600/90 text-white"
                : "bg-red-600/90 text-white"
            }`}
          >
            {store.isActive !== false
              ? "Open"
              : "Unavailable"}
          </span>

          <h3 className="absolute bottom-4 left-4 right-4 line-clamp-1 text-lg font-bold text-white drop-shadow sm:text-xl">
            {storeName}
          </h3>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories
                .slice(0, 3)
                .map((category) => (
                  <span
                    key={
                      category._id ||
                      category.name
                    }
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-gray-800 dark:text-primary-500"
                  >
                    {category.name}
                  </span>
                ))
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                General
              </span>
            )}

            {categories.length > 3 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                +{categories.length - 3}
              </span>
            )}
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {description}
          </p>

          <div className="mt-auto space-y-2 pt-5 text-sm text-gray-500 dark:text-gray-400">
            <p className="flex min-w-0 items-start gap-2">
              <span className="shrink-0">
                📍
              </span>

              <span className="line-clamp-2">
                {address}
              </span>
            </p>

            {contactNumber && (
              <p className="flex items-center gap-2">
                <span>📞</span>
                <span>
                  {contactNumber}
                </span>
              </p>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="text-sm font-semibold text-primary-600">
              Visit Store
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition duration-200 group-hover:translate-x-1 group-hover:bg-primary-600 group-hover:text-white dark:bg-gray-800 dark:text-primary-500">
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default StoreCard;