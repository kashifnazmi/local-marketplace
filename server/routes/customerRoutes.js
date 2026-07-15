const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getAllStores, getStoreById } = require("../controllers/storeController");
const { getAllProducts, getProductById } = require("../controllers/productController");
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");
const { placeOrder, getMyOrders } = require("../controllers/orderController");

// Public-ish (browse) routes - still require login as per role model, but no vendor/admin restriction
router.get("/stores", getAllStores);
router.get("/stores/:id", getStoreById);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);

// Cart & Orders require customer login
router.use(protect, authorize("customer"));

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:productId", updateCartItem);
router.delete("/cart/:productId", removeFromCart);
router.delete("/cart", clearCart);

router.post("/orders", placeOrder);
router.get("/orders", getMyOrders);

module.exports = router;
