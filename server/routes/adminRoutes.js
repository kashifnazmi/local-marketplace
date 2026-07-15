const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboardStats,
  getVendorApplications,
  approveVendor,
  rejectVendor,
  getAllStoresAdmin,
  toggleStoreStatus,
  getAllProductsAdmin,
  deleteProductAdmin,
  getAllOrdersAdmin,
  getOrderDetailAdmin,
} = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/vendors", getVendorApplications);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/reject", rejectVendor);

router.get("/stores", getAllStoresAdmin);
router.put("/stores/:id/toggle", toggleStoreStatus);

router.get("/products", getAllProductsAdmin);
router.delete("/products/:id", deleteProductAdmin);

router.get("/orders", getAllOrdersAdmin);
router.get("/orders/:id", getOrderDetailAdmin);

module.exports = router;
