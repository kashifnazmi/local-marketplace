const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    productImage: { type: String, default: "" },
    returnEligible: { type: Boolean, default: false },
    isDeletedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ productName: "text" });

module.exports = mongoose.model("Product", productSchema);
