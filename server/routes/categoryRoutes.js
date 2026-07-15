const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { getCategories, createCategory } = require("../controllers/categoryController");

router.get("/", getCategories);
router.post("/", protect, authorize("admin"), createCategory);

module.exports = router;
