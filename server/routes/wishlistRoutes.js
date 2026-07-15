const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist,
} = require("../controllers/wishlistController");

const {
  protect,
  authorize,
} = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.use(authorize("customer"));

router.get("/", getWishlist);
router.delete("/", clearWishlist);
router.get("/check/:productId", checkWishlistItem);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;