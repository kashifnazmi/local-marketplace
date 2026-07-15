import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Loader from "../components/Loader";
import useAuth from "../hooks/useAuth";

const Checkout = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/customer/cart")
      .then((res) => setCart(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) return toast.error("Delivery address is required");
    if (items.length === 0) return toast.error("Your cart is empty");

    setPlacing(true);
    try {
      await api.post("/customer/orders", { deliveryAddress: address });
      toast.success("Order placed successfully! (Cash on Delivery)");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        {items.map((item) => (
          <div key={item.product._id} className="flex justify-between text-sm py-1.5 border-b last:border-0">
            <span>{item.product.productName} × {item.quantity}</span>
            <span>₹{item.product.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-3 pt-3 border-t">
          <span>Order Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Delivery Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={3}
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
          Payment Method: <span className="font-medium text-gray-700">Cash on Delivery (COD)</span>
        </div>
        <button
          disabled={placing}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {placing ? "Placing order..." : "Place Order (COD)"}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
