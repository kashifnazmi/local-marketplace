import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import StoreCard from "../components/StoreCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import FAQ from "../components/FAQ";
import useAuth from "../hooks/useAuth";

const PRODUCTS_PER_PAGE = 10;

const Home = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    }
  };

  const fetchProducts = async (
    pageNumber = 1,
    selectedCategory = category
  ) => {
    const response = await api.get("/customer/products", {
      params: {
        search,
        category: selectedCategory,
        sort,
        page: pageNumber,
        limit: PRODUCTS_PER_PAGE,
      },
    });

    setProducts(response.data.data || []);
    setCurrentPage(response.data.currentPage || 1);
    setTotalPages(response.data.totalPages || 1);
    setTotalProducts(response.data.totalProducts || 0);
  };

  const fetchStores = async (
    selectedCategory = category
  ) => {
    const response = await api.get("/customer/stores", {
      params: {
        search,
        category: selectedCategory,
      },
    });

    setStores(response.data.data || []);
  };

  const loadPageData = async (
    pageNumber = 1,
    selectedCategory = category
  ) => {
    setLoading(true);

    try {
      if (activeTab === "products") {
        await fetchProducts(pageNumber, selectedCategory);
      } else {
        await fetchStores(selectedCategory);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load marketplace data"
      );

      if (activeTab === "products") {
        setProducts([]);
        setTotalProducts(0);
        setCurrentPage(1);
        setTotalPages(1);
      } else {
        setStores([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadPageData(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sort]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    setCurrentPage(1);
    await loadPageData(1);
  };

  const handleCategoryChange = async (event) => {
    const selectedCategory = event.target.value;

    setCategory(selectedCategory);
    setCurrentPage(1);

    await loadPageData(1, selectedCategory);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearch("");
    setCategory("");
    setCurrentPage(1);
  };

  const changePage = async (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === currentPage
    ) {
      return;
    }

    setLoading(true);

    try {
      await fetchProducts(pageNumber);

      document
        .getElementById("marketplace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to change page"
      );
    } finally {
      setLoading(false);
    }
  };

  const getVisiblePageNumbers = () => {
    const pageNumbers = [];

    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, totalPages);

    if (endPage - startPage < 4) {
      startPage = Math.max(endPage - 4, 1);
    }

    for (
      let pageNumber = startPage;
      pageNumber <= endPage;
      pageNumber += 1
    ) {
      pageNumbers.push(pageNumber);
    }

    return pageNumbers;
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 transition-colors dark:bg-gray-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500 text-white">
        <div className="absolute -left-24 top-10 h-72 w-72 animate-pulse rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 animate-pulse rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="page-enter">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
              Shop local, grow together
            </p>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Discover trusted local stores and quality products
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Browse nearby stores, compare products and support
              local vendors from one simple marketplace.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("marketplace")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="hover-lift w-full rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition hover:bg-blue-50 sm:w-auto"
              >
                Explore Products
              </button>

              {!user && (
                <a
                  href="/register"
                  className="hover-lift w-full rounded-lg border border-white/40 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
                >
                  Become a Vendor
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                value: `${totalProducts}+`,
                label: "Products available",
              },
              {
                value: `${categories.length}+`,
                label: "Categories",
              },
              {
                value: "100%",
                label: "Local vendors",
              },
              {
                value: "24/7",
                label: "Product browsing",
              },
            ].map((item, index) => (
              <div
                key={item.label}
                className="animate-card hover-lift rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur sm:p-5"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <p className="text-2xl font-bold sm:text-3xl">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="marketplace"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
            Explore Marketplace
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {user
              ? `Welcome back, ${user.name}.`
              : "Search products and stores available in your marketplace."}
          </p>
        </div>

        <div className="animate-card mb-7 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex w-full rounded-lg border border-gray-200 dark:border-gray-700 sm:w-fit">
              <button
                type="button"
                onClick={() => handleTabChange("products")}
                className={`flex-1 rounded-l-lg px-5 py-3 text-sm font-medium transition sm:flex-none ${
                  activeTab === "products"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Products
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("stores")}
                className={`flex-1 rounded-r-lg px-5 py-3 text-sm font-medium transition sm:flex-none ${
                  activeTab === "stores"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Stores
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_190px_190px_auto]"
            >
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={
                  activeTab === "products"
                    ? "Search products..."
                    : "Search stores..."
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Categories</option>

                {categories.map((item) => (
                  <option
                    key={item._id}
                    value={item._id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              {activeTab === "products" ? (
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="newest">
                    Newest First
                  </option>
                  <option value="oldest">
                    Oldest First
                  </option>
                  <option value="price_asc">
                    Price: Low to High
                  </option>
                  <option value="price_desc">
                    Price: High to Low
                  </option>
                  <option value="name_asc">
                    Name: A to Z
                  </option>
                  <option value="name_desc">
                    Name: Z to A
                  </option>
                </select>
              ) : (
                <div className="hidden lg:block" />
              )}

              <button
                type="submit"
                className="hover-lift w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {activeTab === "products" && !loading && (
          <div className="mb-5 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between dark:text-gray-400">
            <p>
              {totalProducts}{" "}
              {totalProducts === 1
                ? "product"
                : "products"}{" "}
              found
            </p>

            <p>
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : activeTab === "products" ? (
          products.length === 0 ? (
            <EmptyState message="No products found." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    animationDelay={Math.min(
                      index * 70,
                      420
                    )}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      changePage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  >
                    Previous
                  </button>

                  {getVisiblePageNumbers().map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                          changePage(pageNumber)
                        }
                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium transition ${
                          currentPage === pageNumber
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      changePage(currentPage + 1)
                    }
                    disabled={
                      currentPage === totalPages
                    }
                    className="h-10 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )
        ) : stores.length === 0 ? (
          <EmptyState message="No stores found." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store, index) => (
              <StoreCard
                key={store._id}
                store={store}
                animationDelay={Math.min(
                  index * 90,
                  450
                )}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            {
              icon: "🏪",
              title: "Verified stores",
              text: "Browse stores managed by approved local vendors.",
            },
            {
              icon: "📦",
              title: "Quality products",
              text: "Discover products across multiple categories.",
            },
            {
              icon: "🛒",
              title: "Easy shopping",
              text: "Search, add to cart and place orders easily.",
            },
            {
              icon: "🤝",
              title: "Support local",
              text: "Help small businesses grow in your community.",
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="animate-card hover-lift rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <span className="text-3xl">
                {feature.icon}
              </span>

              <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <FAQ />
    </main>
  );
};

export default Home;