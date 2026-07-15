const Category = require("../models/Category");

// @desc Get all categories
// @route GET /api/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create category (admin)
// @route POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Category name is required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: "Category already exists" });

    const category = await Category.create({ name });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCategories, createCategory };
