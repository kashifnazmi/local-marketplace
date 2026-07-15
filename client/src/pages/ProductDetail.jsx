import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import useAuth from "../hooks/useAuth";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get(`/customer/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login as a customer to add to cart");
      return navigate("/login");
    }
    if (user.role !== "customer") return toast.error("Only customers can add items to cart");

    setAdding(true);
    try {
      await api.post("/customer/cart", { productId: id, quantity: qty });
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <EmptyState message="Product not found." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
        {product.productImage ? (
          <img src={product.productImage} alt={product.productName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-7xl">📦</span>
        )}
      </div>
      <div>
        <Link to={`/stores/${product.store?._id}`} className="text-xs text-primary-600 font-medium">
          {product.store?.storeName}
        </Link>
        <h1 className="text-2xl font-bold mt-1">{product.productName}</h1>
        <p className="text-sm text-gray-400 mt-1">{product.category?.name}</p>
        <p className="text-3xl font-bold text-primary-600 mt-4">₹{product.price}</p>
        <p className="text-gray-600 mt-4">{product.description}</p>

        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <span>Stock: {product.stockQuantity}</span>
          <span>Return Eligible: {product.returnEligible ? "Yes" : "No"}</span>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <input
            type="number"
            min="1"
            max={product.stockQuantity}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-20 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stockQuantity === 0}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {product.stockQuantity === 0 ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
