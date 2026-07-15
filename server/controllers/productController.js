const Product = require("../models/Product");
const Store = require("../models/Store");

// @desc Add product (vendor)
// @route POST /api/vendor/products
const addProduct = async (req, res) => {
  try {
    const store = await Store.findOne({
      vendor: req.user._id,
    });

    if (!store) {
      return res.status(400).json({
        success: false,
        message:
          "Create a store before adding products",
      });
    }

    const {
      productName,
      description,
      category,
      price,
      stockQuantity,
      productImage,
      returnEligible,
    } = req.body;

    if (
      !productName ||
      price === undefined ||
      stockQuantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, price and stock quantity are required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (Number(stockQuantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity cannot be negative",
      });
    }

    const uploadedImage =
      req.file?.path || productImage || "";

    const product = await Product.create({
      store: store._id,
      vendor: req.user._id,
      productName,
      description,
      category: category || undefined,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      productImage: uploadedImage,
      returnEligible:
        returnEligible === true ||
        returnEligible === "true",
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Edit product (vendor)
// @route PUT /api/vendor/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      productName,
      description,
      category,
      price,
      stockQuantity,
      productImage,
      returnEligible,
    } = req.body;

    if (
      price !== undefined &&
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (
      stockQuantity !== undefined &&
      Number(stockQuantity) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity cannot be negative",
      });
    }

    if (productName !== undefined) {
      product.productName = productName;
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (category !== undefined) {
      product.category =
        category || undefined;
    }

    if (price !== undefined) {
      product.price = Number(price);
    }

    if (stockQuantity !== undefined) {
      product.stockQuantity =
        Number(stockQuantity);
    }

    if (req.file?.path) {
      product.productImage =
        req.file.path;
    } else if (productImage !== undefined) {
      product.productImage =
        productImage;
    }

    if (returnEligible !== undefined) {
      product.returnEligible =
        returnEligible === true ||
        returnEligible === "true";
    }

    await product.save();

    const updatedProduct =
      await Product.findById(
        product._id
      )
        .populate("category", "name")
        .populate(
          "store",
          "storeName isActive"
        );

    res.json({
      success: true,
      message:
        "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Delete product (vendor)
// @route DELETE /api/vendor/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product =
      await Product.findOneAndDelete({
        _id: req.params.id,
        vendor: req.user._id,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get vendor's own product list
// @route GET /api/vendor/products
const getMyProducts = async (
  req,
  res
) => {
  try {
    const products =
      await Product.find({
        vendor: req.user._id,
      })
        .populate("category", "name")
        .populate(
          "store",
          "storeName isActive"
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

// @desc Get all products with search, filter, sorting and pagination
// @route GET /api/customer/products
const getAllProducts = async (
  req,
  res
) => {
  try {
    const {
      search,
      category,
      store,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      isDeletedByAdmin: false,
    };

    if (search) {
      filter.productName = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (store) {
      filter.store = store;
    }

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "price_asc":
        sortOption = {
          price: 1,
        };
        break;

      case "price_desc":
        sortOption = {
          price: -1,
        };
        break;

      case "name_asc":
        sortOption = {
          productName: 1,
        };
        break;

      case "name_desc":
        sortOption = {
          productName: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const productsPerPage =
      Math.min(
        Math.max(
          parseInt(limit, 10) || 10,
          1
        ),
        50
      );

    const products =
      await Product.find(filter)
        .populate("category", "name")
        .populate(
          "store",
          "storeName isActive"
        )
        .sort(sortOption);

    const visibleProducts =
      products.filter(
        (product) =>
          product.store &&
          product.store.isActive
      );

    const totalProducts =
      visibleProducts.length;

    const totalPages = Math.max(
      Math.ceil(
        totalProducts /
          productsPerPage
      ),
      1
    );

    const safePage = Math.min(
      currentPage,
      totalPages
    );

    const startIndex =
      (safePage - 1) *
      productsPerPage;

    const paginatedProducts =
      visibleProducts.slice(
        startIndex,
        startIndex +
          productsPerPage
      );

    res.json({
      success: true,
      count:
        paginatedProducts.length,
      totalProducts,
      currentPage: safePage,
      totalPages,
      limit: productsPerPage,
      data: paginatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get single product detail
// @route GET /api/customer/products/:id
const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      )
        .populate("category", "name")
        .populate(
          "store",
          "storeName address contactNumber isActive"
        );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
};