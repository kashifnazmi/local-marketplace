const express = require("express");

const router = express.Router();

const {
  protect,
  authorize,
} = require("../middleware/auth");

const upload = require("../middleware/upload");

const {
  createStore,
  getMyStore,
  updateMyStore,
} = require("../controllers/storeController");

const {
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");

const {
  getVendorOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

// All routes below are available only to approved vendors
router.use(protect, authorize("vendor"));

// Store routes
router.post("/store", createStore);
router.get("/store", getMyStore);
router.put("/store", updateMyStore);

// Product routes
router.post(
  "/products",
  upload.single("productImage"),
  addProduct
);

router.get("/products", getMyProducts);

router.put(
  "/products/:id",
  upload.single("productImage"),
  updateProduct
);

router.delete(
  "/products/:id",
  deleteProduct
);

// Order routes
router.get(
  "/orders",
  getVendorOrders
);

router.put(
  "/orders/:id",
  updateOrderStatus
);

module.exports = router;