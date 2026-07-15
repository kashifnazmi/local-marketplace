const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });
  if (!cart) {
    cart = await Cart.create({ customer: customerId, items: [] });
  }
  return cart;
};

// @desc Get customer cart
// @route GET /api/customer/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: "items.product",
      select: "productName price productImage stockQuantity store",
    });
    if (!cart) cart = await getOrCreateCart(req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add product to cart
// @route POST /api/customer/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const qty = quantity && quantity > 0 ? quantity : 1;

    let cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    res.json({ success: true, message: "Product added to cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update quantity of an item in cart
// @route PUT /api/customer/cart/:productId
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();
    res.json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove item from cart
// @route DELETE /api/customer/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ success: true, message: "Item removed from cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Clear entire cart
// @route DELETE /api/customer/cart
const clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
