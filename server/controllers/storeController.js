const Store = require("../models/Store");

// Create vendor store
const createStore = async (req, res) => {
  try {
    const existing = await Store.findOne({ vendor: req.user._id });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Store already exists for this vendor",
      });
    }

    const {
      storeName,
      description,
      address,
      categories,
      contactNumber,
    } = req.body;

    if (!storeName || !address || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Store name, address and contact number are required",
      });
    }

    const store = await Store.create({
      vendor: req.user._id,
      storeName,
      description,
      address,
      categories: Array.isArray(categories) ? categories : [],
      contactNumber,
    });

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get vendor's own store
const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      vendor: req.user._id,
    }).populate("categories", "name");

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "No store found. Please create one.",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update vendor store
const updateMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({
      vendor: req.user._id,
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const {
      storeName,
      description,
      address,
      categories,
      contactNumber,
    } = req.body;

    if (storeName) store.storeName = storeName;

    if (description !== undefined) {
      store.description = description;
    }

    if (address) store.address = address;

    if (Array.isArray(categories)) {
      store.categories = categories;
    }

    if (contactNumber) {
      store.contactNumber = contactNumber;
    }

    await store.save();

    const populatedStore = await Store.findById(store._id).populate(
      "categories",
      "name"
    );

    res.json({
      success: true,
      message: "Store updated successfully",
      data: populatedStore,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all active stores
const getAllStores = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      isActive: true,
    };

    if (search) {
      filter.storeName = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.categories = category;
    }

    const stores = await Store.find(filter).populate(
      "categories",
      "name"
    );

    res.json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single store
const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate(
      "categories",
      "name"
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStore,
  getMyStore,
  updateMyStore,
  getAllStores,
  getStoreById,
};