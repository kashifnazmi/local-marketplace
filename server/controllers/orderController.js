const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const Store = require("../models/Store");

// @desc Place COD order from cart (splits by store into multiple orders)
// @route POST /api/customer/orders
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: "Delivery address is required" });
    }

    const cart = await Cart.findOne({ customer: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Group cart items by store
    const itemsByStore = {};
    for (const item of cart.items) {
      if (!item.product) continue;
      const storeId = item.product.store.toString();
      if (!itemsByStore[storeId]) itemsByStore[storeId] = [];
      itemsByStore[storeId].push(item);
    }

    const createdOrders = [];

    for (const storeId of Object.keys(itemsByStore)) {
      const store = await Store.findById(storeId);
      if (!store) continue;

      const items = itemsByStore[storeId];
      let orderTotal = 0;
      for (const item of items) {
        if (item.quantity > item.product.stockQuantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.productName}`,
          });
        }
        orderTotal += item.product.price * item.quantity;
      }

      const order = await Order.create({
        customer: req.user._id,
        store: storeId,
        vendor: store.vendor,
        deliveryAddress,
        orderTotal,
        paymentMethod: "COD",
        status: "pending",
      });

      for (const item of items) {
        await OrderItem.create({
          order: order._id,
          product: item.product._id,
          productName: item.product.productName,
          price: item.product.price,
          quantity: item.quantity,
        });

        // reduce stock
        item.product.stockQuantity -= item.quantity;
        await item.product.save();
      }

      createdOrders.push(order);
    }

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order(s) placed successfully", data: createdOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get customer's own order history
// @route GET /api/customer/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("store", "storeName")
      .sort({ createdAt: -1 });

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id });
        return { ...order.toObject(), items };
      })
    );

    res.json({ success: true, count: orders.length, data: ordersWithItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get vendor's incoming orders
// @route GET /api/vendor/orders
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user._id })
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id });
        return { ...order.toObject(), items };
      })
    );

    res.json({ success: true, count: orders.length, data: ordersWithItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Vendor accepts / rejects / updates order status
// @route PUT /api/vendor/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["accepted", "rejected", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findOne({ _id: req.params.id, vendor: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getVendorOrders, updateOrderStatus };
