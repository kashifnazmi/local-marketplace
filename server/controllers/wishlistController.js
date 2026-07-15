const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// @desc Add product to wishlist
// @route POST /api/customer/wishlist/:productId
// @access Customer
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isDeletedByAdmin: false,
    }).populate("store", "storeName isActive");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.store || !product.store.isActive) {
      return res.status(400).json({
        success: false,
        message: "This product is not currently available",
      });
    }

    const existingWishlistItem = await Wishlist.findOne({
      customer: req.user._id,
      product: productId,
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    const wishlistItem = await Wishlist.create({
      customer: req.user._id,
      product: productId,
    });

    const populatedWishlistItem = await Wishlist.findById(
      wishlistItem._id
    ).populate({
      path: "product",
      populate: [
        {
          path: "category",
          select: "name",
        },
        {
          path: "store",
          select: "storeName isActive",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: populatedWishlistItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get logged-in customer's wishlist
// @route GET /api/customer/wishlist
// @access Customer
const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({
      customer: req.user._id,
    })
      .populate({
        path: "product",
        populate: [
          {
            path: "category",
            select: "name",
          },
          {
            path: "store",
            select: "storeName isActive",
          },
        ],
      })
      .sort({ createdAt: -1 });

    const validWishlistItems = wishlistItems.filter(
      (item) =>
        item.product &&
        !item.product.isDeletedByAdmin &&
        item.product.store &&
        item.product.store.isActive
    );

    return res.json({
      success: true,
      count: validWishlistItems.length,
      data: validWishlistItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Remove one product from wishlist
// @route DELETE /api/customer/wishlist/:productId
// @access Customer
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      customer: req.user._id,
      product: productId,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    }

    return res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Check whether a product is in wishlist
// @route GET /api/customer/wishlist/check/:productId
// @access Customer
const checkWishlistItem = async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      customer: req.user._id,
      product: req.params.productId,
    });

    return res.json({
      success: true,
      isWishlisted: Boolean(wishlistItem),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Remove all products from wishlist
// @route DELETE /api/customer/wishlist
// @access Customer
const clearWishlist = async (req, res) => {
  try {
    const result = await Wishlist.deleteMany({
      customer: req.user._id,
    });

    return res.json({
      success: true,
      message: "Wishlist cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist,
};