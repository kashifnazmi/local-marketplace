const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc Admin dashboard analytics
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalVendors,
      totalStores,
      totalProducts,
      totalOrders,
      activeStores,
      inactiveStores,
      approvedVendors,
      pendingVendors,
      rejectedVendors,
    ] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "vendor",
      }),

      Store.countDocuments(),

      Product.countDocuments({
        isDeletedByAdmin: false,
      }),

      Order.countDocuments(),

      Store.countDocuments({
        isActive: true,
      }),

      Store.countDocuments({
        isActive: false,
      }),

      Vendor.countDocuments({
        status: "approved",
      }),

      Vendor.countDocuments({
        status: "pending",
      }),

      Vendor.countDocuments({
        status: "rejected",
      }),
    ]);

    /*
      Order status analytics

      Status names are converted to lowercase so values such as:
      Pending, pending, DELIVERED etc. are handled consistently.
    */
    const orderStatusAggregation = await Order.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $ifNull: ["$status", "pending"],
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const orderStatus = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStatusAggregation.forEach((item) => {
      const normalizedStatus = String(item._id)
        .trim()
        .toLowerCase()
        .replaceAll(" ", "")
        .replaceAll("_", "")
        .replaceAll("-", "");

      if (normalizedStatus === "pending") {
        orderStatus.pending = item.count;
      } else if (normalizedStatus === "confirmed") {
        orderStatus.confirmed = item.count;
      } else if (normalizedStatus === "processing") {
        orderStatus.processing = item.count;
      } else if (normalizedStatus === "shipped") {
        orderStatus.shipped = item.count;
      } else if (
        normalizedStatus === "outfordelivery"
      ) {
        orderStatus.outForDelivery = item.count;
      } else if (normalizedStatus === "delivered") {
        orderStatus.delivered = item.count;
      } else if (
        normalizedStatus === "cancelled" ||
        normalizedStatus === "canceled"
      ) {
        orderStatus.cancelled = item.count;
      }
    });

    /*
      Last 6 months date range
    */
    const sixMonthsAgo = new Date();

    sixMonthsAgo.setMonth(
      sixMonthsAgo.getMonth() - 5
    );

    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    /*
      Monthly orders and revenue.

      The revenue expression supports common order amount fields:
      totalAmount, grandTotal, totalPrice and amount.
    */
    const monthlyAnalyticsAggregation =
      await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: sixMonthsAgo,
            },
          },
        },

        {
          $addFields: {
            calculatedRevenue: {
              $ifNull: [
                "$totalAmount",
                {
                  $ifNull: [
                    "$grandTotal",
                    {
                      $ifNull: [
                        "$totalPrice",
                        {
                          $ifNull: [
                            "$amount",
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            orders: {
              $sum: 1,
            },

            revenue: {
              $sum: {
                $convert: {
                  input: "$calculatedRevenue",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    const monthlyAnalytics = [];

    for (let index = 0; index < 6; index += 1) {
      const currentDate = new Date(
        sixMonthsAgo.getFullYear(),
        sixMonthsAgo.getMonth() + index,
        1
      );

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const matchingMonth =
        monthlyAnalyticsAggregation.find(
          (item) =>
            item._id.year === year &&
            item._id.month === month
        );

      monthlyAnalytics.push({
        month: currentDate.toLocaleString(
          "en-IN",
          {
            month: "short",
            year: "2-digit",
          }
        ),

        orders: matchingMonth?.orders || 0,
        revenue: matchingMonth?.revenue || 0,
      });
    }

    /*
      Total revenue from all orders.

      This uses the same common amount-field fallback.
    */
    const revenueAggregation =
      await Order.aggregate([
        {
          $addFields: {
            calculatedRevenue: {
              $ifNull: [
                "$totalAmount",
                {
                  $ifNull: [
                    "$grandTotal",
                    {
                      $ifNull: [
                        "$totalPrice",
                        {
                          $ifNull: [
                            "$amount",
                            0,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: {
                $convert: {
                  input: "$calculatedRevenue",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
        },
      ]);

    const totalRevenue =
      revenueAggregation[0]?.totalRevenue || 0;

    /*
      Product count grouped by category
    */
    const productsByCategory =
      await Product.aggregate([
        {
          $match: {
            isDeletedByAdmin: false,
          },
        },

        {
          $group: {
            _id: "$category",
            count: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },

        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            name: {
              $ifNull: [
                "$category.name",
                "Uncategorized",
              ],
            },
            count: 1,
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    /*
      Recent orders
    */
    const recentOrders = await Order.find()
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "store",
        "storeName"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();

    res.json({
      success: true,

      data: {
        totalCustomers,
        totalVendors,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue,

        activeStores,
        inactiveStores,

        approvedVendors,
        pendingVendors,
        rejectedVendors,

        pendingOrders:
          orderStatus.pending,

        confirmedOrders:
          orderStatus.confirmed,

        processingOrders:
          orderStatus.processing,

        shippedOrders:
          orderStatus.shipped,

        outForDeliveryOrders:
          orderStatus.outForDelivery,

        deliveredOrders:
          orderStatus.delivered,

        cancelledOrders:
          orderStatus.cancelled,

        orderStatus,
        monthlyAnalytics,
        productsByCategory,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc View all vendor applications
// @route GET /api/admin/vendors
const getVendorApplications = async (
  req,
  res
) => {
  try {
    const vendors = await Vendor.find()
      .populate(
        "user",
        "name email phone createdAt"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Approve a vendor
// @route PUT /api/admin/vendors/:id/approve
const approveVendor = async (
  req,
  res
) => {
  try {
    const vendor = await Vendor.findById(
      req.params.id
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor application not found",
      });
    }

    vendor.status = "approved";
    vendor.approvedAt = new Date();

    await vendor.save();

    res.json({
      success: true,
      message: "Vendor approved",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Reject a vendor
// @route PUT /api/admin/vendors/:id/reject
const rejectVendor = async (
  req,
  res
) => {
  try {
    const vendor = await Vendor.findById(
      req.params.id
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message:
          "Vendor application not found",
      });
    }

    vendor.status = "rejected";
    vendor.approvedAt = null;

    await vendor.save();

    res.json({
      success: true,
      message: "Vendor rejected",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc View all stores
// @route GET /api/admin/stores
const getAllStoresAdmin = async (
  req,
  res
) => {
  try {
    const stores = await Store.find()
      .populate(
        "vendor",
        "name email"
      )
      .populate(
        "categories",
        "name"
      )
     
      .sort({
        createdAt: -1,
      });

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

// @desc Enable / Disable a store
// @route PUT /api/admin/stores/:id/toggle
const toggleStoreStatus = async (
  req,
  res
) => {
  try {
    const store = await Store.findById(
      req.params.id
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.isActive = !store.isActive;

    await store.save();

    res.json({
      success: true,
      message: `Store ${
        store.isActive
          ? "enabled"
          : "disabled"
      } successfully`,
      data: store,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc View all products
// @route GET /api/admin/products
const getAllProductsAdmin = async (
  req,
  res
) => {
  try {
    const products = await Product.find()
      .populate(
        "store",
        "storeName"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete inappropriate product
// @route DELETE /api/admin/products/:id
const deleteProductAdmin = async (
  req,
  res
) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message:
        "Product deleted by admin",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc View all orders
// @route GET /api/admin/orders
const getAllOrdersAdmin = async (
  req,
  res
) => {
  try {
    const orders = await Order.find()
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "store",
        "storeName"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc View single order detail
// @route GET /api/admin/orders/:id
const getOrderDetailAdmin = async (
  req,
  res
) => {
  try {
    const OrderItem = require(
      "../models/OrderItem"
    );

    const order = await Order.findById(
      req.params.id
    )
      .populate(
        "customer",
        "name email phone"
      )
      .populate(
        "store",
        "storeName address"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = await OrderItem.find({
      order: order._id,
    }).populate(
      "product",
      "productName productImage"
    );

    res.json({
      success: true,
      data: {
        ...order.toObject(),
        items,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
};