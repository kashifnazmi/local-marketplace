import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const StoreDetail = () => {
  const { id } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoreDetails = async () => {
      setLoading(true);

      try {
        const [storeRes, productsRes] = await Promise.all([
          api.get(`/customer/stores/${id}`),
          api.get("/customer/products", {
            params: {
              store: id,
            },
          }),
        ]);

        setStore(storeRes.data.data);
        setProducts(productsRes.data.data || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load store"
        );

        setStore(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadStoreDetails();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!store) {
    return <EmptyState message="Store not found." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm transition-colors dark:bg-gray-900 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {store.storeName}
          </h1>

          <div className="flex flex-wrap gap-2 mt-3">
            {store.categories?.length > 0 ? (
              store.categories.map((category) => (
                <span
                  key={category._id}
                  className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full dark:bg-primary-950 dark:text-primary-300"
                >
                  {category.name}
                </span>
              ))
            ) : store.category?.name ? (
              <span className="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full dark:bg-primary-950 dark:text-primary-300">
                {store.category.name}
              </span>
            ) : (
              <span className="text-sm text-gray-400">
                General
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-4 dark:text-gray-300">
            {store.description || "No description available."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>📍 {store.address}</span>
            <span>📞 {store.contactNumber}</span>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Products from this store
        </h2>

        {products.length === 0 ? (
          <EmptyState message="This store has no products yet." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;