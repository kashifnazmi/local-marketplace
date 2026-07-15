import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customer/cart");
      setCart(res.data.data);
    } catch (err) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      await api.put(`/customer/cart/${productId}`, { quantity });
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/customer/cart/${productId}`);
      toast.success("Item removed");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/customer/cart");
      toast.success("Cart cleared");
      fetchCart();
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  if (loading) return <Loader />;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Cart</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-sm text-red-500 font-medium hover:underline">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState message="Your cart is empty." />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.product._id} className="bg-white border rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {item.product.productImage ? (
                    <img src={item.product.productImage} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product.productName}</p>
                  <p className="text-primary-600 font-bold text-sm">₹{item.product.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.product._id, item.quantity - 1)} className="w-8 h-8 border rounded-lg text-sm">-</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product._id, item.quantity + 1)} className="w-8 h-8 border rounded-lg text-sm">+</button>
                </div>
                <button onClick={() => removeItem(item.product._id)} className="text-red-400 hover:text-red-600 text-sm ml-2">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-xl p-5 mt-6 flex justify-between items-center">
            <span className="text-lg font-semibold">Total: ₹{total}</span>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
