const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
